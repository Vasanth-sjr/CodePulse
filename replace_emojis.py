import os
import re

emoji_map = {
    '🧠': 'Brain', '📡': 'Radio', '🔗': 'Link', '📊': 'BarChart2',
    '⚠️': 'AlertTriangle', '✉️': 'Mail', '✅': 'CheckCircle', '❌': 'XCircle',
    '📎': 'Paperclip', '🚀': 'Rocket', '📭': 'Inbox', '👥': 'Users',
    '📦': 'Package', '✨': 'Sparkles', '💡': 'Lightbulb', '📋': 'ClipboardList',
    '🔶': 'AlertCircle', '💬': 'MessageSquare', '🧮': 'Calculator'
}

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    found_emojis = set()
    for e in emoji_map:
        if e in content:
            found_emojis.add(e)
            
    if not found_emojis:
        return
        
    print(f"Modifying {filepath}...")
    
    needed_icons = {emoji_map[e] for e in found_emojis}
    
    # 1. Replace emojis based on context
    for e in found_emojis:
        icon = emoji_map[e]
        # Context 1: `<p className="text-4xl...">{emoji}</p>` No data
        content = re.sub(rf'<p className="(.*?text-4xl.*?)">(.*?){e}(.*?)</p>', rf'<{icon} className="\1 mx-auto text-gray-300" />', content)
        # Context 2: `icon: '{emoji}'`
        content = re.sub(rf"icon:\s*'{e}'", f"icon: <{icon} className=\"inline-block w-4 h-4\" />", content)
        # Context 3: direct emoji in div text
        # Just simple replace for remaining
        content = content.replace(e, f'<{icon} className="inline-block w-4 h-4 mr-1 text-emerald-500" />')

    # 2. Add imports
    if needed_icons:
        import_str = "import { " + ", ".join(needed_icons) + " } from 'lucide-react';"
        if 'lucide-react' in content:
            # Append to existing
            pass # Simplified: just add a new import below the first import
        content = re.sub(r'(import React.*?;\n)', rf'\1{import_str}\n', content, count=1)
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith('.jsx'):
            process_file(os.path.join(root, file))

print("Done!")
