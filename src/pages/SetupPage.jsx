import React, { useState, useRef } from 'react';
import { BarChart2, CheckCircle, Brain, Link, Rocket, Paperclip, XCircle, Radio, Mail, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CodePulseLogo from '../components/CodePulseLogo';
import { fetchRepository, analyzeRequirements, connectJira, sendEmailReport } from '../services/api';

export default function SetupPage({ onComplete }) {
  const nav = useNavigate();

  const [repoUrl, setRepoUrl] = useState('');
  const [token, setToken] = useState('');
  const [requirementsText, setRequirementsText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Jira integration state
  const [jiraBaseUrl, setJiraBaseUrl] = useState('');
  const [jiraEmail, setJiraEmail] = useState('');
  const [jiraToken, setJiraToken] = useState('');
  const [jiraProjectKey, setJiraProjectKey] = useState('');
  const [jiraExpanded, setJiraExpanded] = useState(false);
  const [jiraError, setJiraError] = useState('');

  // Email notification state
  const [notifyEmail, setNotifyEmail] = useState('');
  const [sendEmail, setSendEmail] = useState(false);
  const [emailExpanded, setEmailExpanded] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null);

  const hasJiraConfig = jiraBaseUrl.trim() && jiraEmail.trim() && jiraToken.trim();

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      if (file.name.endsWith('.csv')) {
        const lines = text.split('\n')
          .map(line => line.split(',')[0]?.trim())
          .filter(Boolean);
        setRequirementsText(prev => prev ? prev + '\n' + lines.join('\n') : lines.join('\n'));
      } else {
        setRequirementsText(prev => prev ? prev + '\n' + text.trim() : text.trim());
      }
    };
    reader.readAsText(file);
  };

  const getSteps = () => {
    const base = [
      { label: 'Fetching commits...', icon: <Radio className="inline-block w-4 h-4" /> },
      { label: 'Processing requirements...', icon: <Brain className="inline-block w-4 h-4" /> },
    ];
    if (hasJiraConfig) {
      base.push({ label: 'Fetching Jira data...', icon: <Link className="inline-block w-4 h-4" /> });
    }
    base.push(
      { label: 'Calculating impact scores...', icon: <BarChart2 className="inline-block w-4 h-4" /> },
      { label: 'Detecting risks...', icon: <AlertTriangle className="inline-block w-4 h-4" /> },
    );
    if (sendEmail && notifyEmail.trim()) {
      base.push({ label: 'Sending email report...', icon: <Mail className="inline-block w-4 h-4" /> });
    }
    base.push(
      { label: 'Done ✓', icon: <CheckCircle className="inline-block w-4 h-4" /> },
    );
    return base;
  };

  const activeSteps = getSteps();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setJiraError('');

    if (!repoUrl.trim()) {
      setError('Please enter a GitHub repository URL');
      return;
    }

    setIsLoading(true);
    let stepIdx = 0;

    try {
      setCurrentStep(stepIdx++);
      const repoData = await fetchRepository(repoUrl.trim(), token.trim());
      const repoId = repoData.repo_id;

      localStorage.setItem('codepulse_repo_id', String(repoId));
      localStorage.setItem('codepulse_repo_url', repoUrl.trim());
      localStorage.setItem('codepulse_repo_name', repoData.repo);

      setCurrentStep(stepIdx++);
      const requirements = requirementsText
        .split('\n')
        .map(r => r.trim())
        .filter(Boolean);

      if (requirements.length > 0) {
        await analyzeRequirements(requirements, repoId);
        localStorage.setItem('codepulse_requirements', JSON.stringify(requirements));
      }

      if (hasJiraConfig) {
        setCurrentStep(stepIdx++);
        try {
          const jiraResult = await connectJira(
            jiraBaseUrl.trim(),
            jiraEmail.trim(),
            jiraToken.trim(),
            jiraProjectKey.trim() || null,
            repoId
          );
          if (jiraResult.success) {
            localStorage.setItem('codepulse_jira_connected', 'true');
          } else {
            setJiraError(jiraResult.message || 'Jira connection failed');
            localStorage.removeItem('codepulse_jira_connected');
          }
        } catch (jiraErr) {
          setJiraError(jiraErr.detail || jiraErr.message || 'Jira connection failed');
          localStorage.removeItem('codepulse_jira_connected');
        }
      }

      setCurrentStep(stepIdx++);
      await new Promise(r => setTimeout(r, 500));

      setCurrentStep(stepIdx++);
      await new Promise(r => setTimeout(r, 500));

      if (sendEmail && notifyEmail.trim()) {
        setCurrentStep(stepIdx++);
        setEmailStatus('sending');
        try {
          const emailResult = await sendEmailReport(repoId, notifyEmail.trim());
          if (emailResult.status === 'sent') {
            setEmailStatus({ status: 'sent', message: `Report sent to ${notifyEmail.trim()} via ${emailResult.method === 'n8n_webhook' ? 'n8n' : 'SMTP'}` });
          } else if (emailResult.status === 'failed') {
            setEmailStatus({ status: 'failed', message: emailResult.error || 'Email delivery failed' });
          } else {
            setEmailStatus({ status: 'skipped', message: emailResult.reason || 'Email skipped' });
          }
        } catch (emailErr) {
          setEmailStatus({ status: 'failed', message: emailErr.detail || emailErr.message || 'Email delivery failed' });
        }
        await new Promise(r => setTimeout(r, 800));
      }

      setCurrentStep(stepIdx);
      await new Promise(r => setTimeout(r, 800));

      onComplete();
    } catch (err) {
      setError(err.detail || err.message || 'Something went wrong');
      setIsLoading(false);
      setCurrentStep(-1);
    }
  };

  return (
    <div className="min-h-screen transition-colors duration-300 bg-gradient-to-br from-white to-emerald-50/50">
      {/* Ambient glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full blur-[120px] opacity-10 bg-emerald-400"></div>
      </div>

      {/* Top nav */}
      <nav className="relative z-10 flex items-center px-8 py-5">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => nav('/')}>
          <CodePulseLogo size={34} />
          <span className="text-xl font-bold gradient-text">CodePulse</span>
        </div>
      </nav>

      {/* Main content */}
      <div className="relative z-10 max-w-2xl mx-auto px-8 pt-8 pb-20">
        <div className="animate-fade-in mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Connect your repository
          </h1>
          <p className="text-sm mt-2 text-gray-400">
            Enter your GitHub repo URL and business requirements to begin AI-powered analysis
          </p>
        </div>

        {/* Loading overlay */}
        {isLoading && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-8 mb-6 opacity-0 animate-slide-up stagger-1">
            <h3 className="text-lg font-semibold mb-6 text-gray-900">
              Running Analysis...
            </h3>
            <div className="space-y-3">
              {activeSteps.map((step, i) => (
                <div
                  key={step.label}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-500 border ${
                    i < currentStep
                      ? 'bg-emerald-50 border-emerald-200'
                      : i === currentStep
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-gray-50 border-gray-100'
                  }`}
                >
                  <span className="text-lg">{step.icon}</span>
                  <span className={`text-sm font-medium flex-1 ${
                    i <= currentStep ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {step.label}
                  </span>
                  {i < currentStep && (
                    <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {i === currentStep && i < activeSteps.length - 1 && (
                    <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin border-blue-500"></div>
                  )}
                </div>
              ))}
            </div>
            {jiraError && (
              <div className="mt-4 p-3 rounded-lg text-xs font-medium bg-amber-50 border border-amber-200 text-amber-700">
                <AlertTriangle className="inline-block w-4 h-4 mr-1 text-emerald-500" /> Jira: {jiraError} (GitHub analysis continued)
              </div>
            )}
            {emailStatus && emailStatus !== 'sending' && (
              <div className={`mt-4 p-3 rounded-lg text-xs font-medium border ${
                emailStatus.status === 'sent'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : emailStatus.status === 'failed'
                    ? 'bg-red-50 border-red-200 text-red-700'
                    : 'bg-amber-50 border-amber-200 text-amber-700'
              }`}>
                {emailStatus.status === 'sent' ? '<CheckCircle className="inline-block w-4 h-4 mr-1 text-emerald-500" />' : emailStatus.status === 'failed' ? '<XCircle className="inline-block w-4 h-4 mr-1 text-emerald-500" />' : '<AlertTriangle className="inline-block w-4 h-4 mr-1 text-emerald-500" />'}{' '}
                Email: {emailStatus.message}
              </div>
            )}
            <div className="mt-6 w-full h-2 rounded-full overflow-hidden bg-gray-100">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r from-emerald-400 to-emerald-500"
                style={{ width: `${((currentStep + 1) / activeSteps.length) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Form */}
        {!isLoading && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 rounded-xl text-sm font-medium animate-fade-in bg-red-50 border border-red-200 text-red-600">
                <AlertTriangle className="inline-block w-4 h-4 mr-1 text-emerald-500" /> {error}
              </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 opacity-0 animate-slide-up stagger-1">
              <label className="block text-sm font-semibold mb-2 text-gray-900">
                GitHub Repository URL
              </label>
              <input
                id="repo-url-input"
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/org/repo"
                className="w-full px-4 py-3 rounded-lg text-sm transition-colors bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 outline-none"
              />
              <p className="text-xs mt-2 text-gray-400">
                Supports public and private repositories (with token)
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 opacity-0 animate-slide-up stagger-2">
              <label className="block text-sm font-semibold mb-2 text-gray-900">
                GitHub Token <span className="font-normal text-gray-400">(optional)</span>
              </label>
              <input
                id="github-token-input"
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxx"
                className="w-full px-4 py-3 rounded-lg text-sm transition-colors bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 outline-none"
              />
              <p className="text-xs mt-2 text-gray-400">
                Required for private repositories or to increase API rate limits
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 opacity-0 animate-slide-up stagger-3">
              <button
                type="button"
                onClick={() => setJiraExpanded(!jiraExpanded)}
                className="w-full flex items-center justify-between"
              >
                <div className="text-left">
                  <label className="block text-sm font-semibold text-gray-900 cursor-pointer">
                    <Link className="inline-block w-4 h-4 mr-1 text-emerald-500" /> Jira Integration <span className="font-normal text-gray-400">(optional)</span>
                  </label>
                  <p className="text-xs mt-1 text-gray-400">
                    Connect Jira to enable plan vs reality analysis
                  </p>
                </div>
                <svg
                  className={`w-5 h-5 transition-transform duration-200 text-gray-500 ${jiraExpanded ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {jiraExpanded && (
                <div className="mt-4 space-y-4 pt-4 border-t border-gray-50">
                  <div>
                    <label className="block text-xs font-medium mb-1.5 text-gray-700">
                      Jira Base URL
                    </label>
                    <input
                      id="jira-base-url"
                      type="text"
                      value={jiraBaseUrl}
                      onChange={(e) => setJiraBaseUrl(e.target.value)}
                      placeholder="https://your-domain.atlassian.net"
                      className="w-full px-4 py-3 rounded-lg text-sm transition-colors bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5 text-gray-700">
                      Jira Email
                    </label>
                    <input
                      id="jira-email"
                      type="email"
                      value={jiraEmail}
                      onChange={(e) => setJiraEmail(e.target.value)}
                      placeholder="user@company.com"
                      className="w-full px-4 py-3 rounded-lg text-sm transition-colors bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5 text-gray-700">
                      Jira API Token
                    </label>
                    <input
                      id="jira-api-token"
                      type="password"
                      value={jiraToken}
                      onChange={(e) => setJiraToken(e.target.value)}
                      placeholder="••••••••••••••"
                      className="w-full px-4 py-3 rounded-lg text-sm transition-colors bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5 text-gray-700">
                      Project Key <span className="font-normal text-gray-400">(optional)</span>
                    </label>
                    <input
                      id="jira-project-key"
                      type="text"
                      value={jiraProjectKey}
                      onChange={(e) => setJiraProjectKey(e.target.value)}
                      placeholder="PROJ"
                      className="w-full px-4 py-3 rounded-lg text-sm transition-colors bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 opacity-0 animate-slide-up stagger-3">
              <button
                type="button"
                onClick={() => setEmailExpanded(!emailExpanded)}
                className="w-full flex items-center justify-between"
              >
                <div className="text-left">
                  <label className="block text-sm font-semibold text-gray-900 cursor-pointer">
                    <Mail className="inline-block w-4 h-4 mr-1 text-emerald-500" /> Email Notifications <span className="font-normal text-gray-400">(optional)</span>
                  </label>
                  <p className="text-xs mt-1 text-gray-400">
                    Get automated project insights delivered to your inbox
                  </p>
                </div>
                <svg
                  className={`w-5 h-5 transition-transform duration-200 text-gray-500 ${emailExpanded ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {emailExpanded && (
                <div className="mt-4 space-y-4 pt-4 border-t border-gray-50">
                  <div>
                    <label className="block text-xs font-medium mb-1.5 text-gray-700">
                      Email Address
                    </label>
                    <input
                      id="notify-email-input"
                      type="email"
                      value={notifyEmail}
                      onChange={(e) => setNotifyEmail(e.target.value)}
                      placeholder="manager@company.com"
                      className="w-full px-4 py-3 rounded-lg text-sm transition-colors bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 outline-none"
                    />
                  </div>
                  <label
                    htmlFor="send-email-checkbox"
                    className="flex items-center gap-3 cursor-pointer select-none px-3 py-2.5 rounded-lg transition-colors hover:bg-gray-50 border border-transparent hover:border-gray-100"
                  >
                    <input
                      id="send-email-checkbox"
                      type="checkbox"
                      checked={sendEmail}
                      onChange={(e) => setSendEmail(e.target.checked)}
                      className="w-4 h-4 rounded border-2 transition-colors cursor-pointer border-gray-300 bg-white accent-emerald-500"
                    />
                    <span className="text-sm text-gray-700">
                      Send automated project insights via email
                    </span>
                  </label>
                  {sendEmail && !notifyEmail.trim() && (
                    <p className="text-xs px-1 text-amber-600">
                      <AlertTriangle className="inline-block w-4 h-4 mr-1 text-emerald-500" /> Please enter an email address to receive notifications
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 opacity-0 animate-slide-up stagger-4">
              <label className="block text-sm font-semibold mb-2 text-gray-900">
                Business Requirements
              </label>
              <textarea
                id="requirements-textarea"
                value={requirementsText}
                onChange={(e) => setRequirementsText(e.target.value)}
                placeholder="Enter one requirement per line, e.g.:\nAdd user authentication\nImplement payment gateway\nBuild product search feature"
                rows={6}
                className="w-full px-4 py-3 rounded-lg text-sm resize-none transition-colors bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 outline-none"
              />

              <div className="mt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-lg text-xs font-medium transition-colors bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 shadow-sm"
                >
                  <Paperclip className="inline-block w-4 h-4 mr-1 text-emerald-500" /> Upload requirements (.txt / .csv)
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>

            <div className="opacity-0 animate-slide-up stagger-5">
              <button
                id="run-analysis-btn"
                type="submit"
                className="w-full py-4 rounded-xl text-base font-semibold text-white transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg bg-emerald-500 hover:bg-emerald-600"
              >
                <Rocket className="inline-block w-4 h-4 mr-1 text-emerald-500" /> Run Analysis
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
