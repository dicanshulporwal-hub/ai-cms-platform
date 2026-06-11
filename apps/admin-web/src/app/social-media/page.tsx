'use client';

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  CheckCircle2,
  Loader2,
  Pencil,
  Plus,
  Rocket,
  Send,
  Settings,
  Share2,
  Trash2,
  XCircle,
} from 'lucide-react';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { apiClient } from '@/lib/api-client';

type TabKey = 'posts' | 'accounts' | 'settings';

interface ListResponse<T> {
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

interface SocialSummary {
  accounts: number;
  connectedAccounts: number;
  posts: number;
  draftPosts: number;
  queuedPosts: number;
  publishedPosts: number;
  failedTargets: number;
}

interface SocialAccount {
  id: string;
  platformKey: string;
  accountName: string;
  accountHandle: string | null;
  profileUrl: string | null;
  profileImageUrl: string | null;
  status: string;
  updatedAt: string;
}

interface SocialTarget {
  id: string;
  platformKey: string;
  status: string;
  externalPostUrl: string | null;
  errorMessage: string | null;
  socialAccount: {
    id: string;
    accountName: string;
    accountHandle: string | null;
    platformKey: string;
    status: string;
  };
}

interface SocialPost {
  id: string;
  title: string;
  content: string;
  linkUrl: string | null;
  hashtagsJson: unknown;
  status: string;
  scheduledAt: string | null;
  publishedAt: string | null;
  updatedAt: string;
  targets: SocialTarget[];
}

interface SocialSettings {
  id: string;
  isEnabled: boolean;
  autoPostBlogsEnabled: boolean;
  autoPostNewsroomEnabled: boolean;
  autoPostAnnouncementsEnabled: boolean;
  requireApprovalBeforeSocialPost: boolean;
  defaultHashtagsJson: unknown;
  maxRetries: number;
  retryBackoffSeconds: number;
}

const accountStatusLabels: Record<string, string> = {
  SOCIAL_CONNECTED: 'Connected',
  SOCIAL_DISCONNECTED: 'Disconnected',
  SOCIAL_TOKEN_EXPIRED: 'Token Expired',
  SOCIAL_ERROR: 'Error',
  SOCIAL_DISABLED: 'Disabled',
};

const postStatusLabels: Record<string, string> = {
  SOCIAL_POST_DRAFT: 'Draft',
  SOCIAL_POST_PENDING_APPROVAL: 'Pending Approval',
  SOCIAL_POST_APPROVED: 'Approved',
  SOCIAL_POST_QUEUED: 'Queued',
  SOCIAL_POST_PUBLISHING: 'Publishing',
  SOCIAL_POST_PUBLISHED: 'Published',
  SOCIAL_POST_PARTIALLY_PUBLISHED: 'Partially Published',
  SOCIAL_POST_FAILED: 'Failed',
  SOCIAL_POST_CANCELLED: 'Cancelled',
};

const badgeClasses: Record<string, string> = {
  SOCIAL_CONNECTED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  SOCIAL_DISCONNECTED: 'bg-gray-50 text-gray-700 border-gray-200',
  SOCIAL_TOKEN_EXPIRED: 'bg-amber-50 text-amber-700 border-amber-200',
  SOCIAL_ERROR: 'bg-red-50 text-red-700 border-red-200',
  SOCIAL_DISABLED: 'bg-gray-50 text-gray-500 border-gray-200',
  SOCIAL_POST_DRAFT: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  SOCIAL_POST_PENDING_APPROVAL: 'bg-blue-50 text-blue-800 border-blue-200',
  SOCIAL_POST_APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  SOCIAL_POST_QUEUED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  SOCIAL_POST_PUBLISHING: 'bg-purple-50 text-purple-700 border-purple-200',
  SOCIAL_POST_PUBLISHED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  SOCIAL_POST_PARTIALLY_PUBLISHED: 'bg-amber-50 text-amber-800 border-amber-200',
  SOCIAL_POST_FAILED: 'bg-red-50 text-red-700 border-red-200',
  SOCIAL_POST_CANCELLED: 'bg-gray-50 text-gray-600 border-gray-200',
};

const emptyAccountForm = {
  platformKey: 'linkedin',
  accountName: '',
  accountHandle: '',
  profileUrl: '',
  profileImageUrl: '',
  status: 'SOCIAL_CONNECTED',
};

const emptyPostForm = {
  title: '',
  content: '',
  linkUrl: '',
  hashtagsText: '',
  scheduledAt: '',
  accountIds: [] as string[],
};

export default function SocialMediaPage() {
  return <AdminPageShell sectionTitle="Social Media">{() => <SocialMediaContent />}</AdminPageShell>;
}

function SocialMediaContent() {
  const [activeTab, setActiveTab] = useState<TabKey>('posts');
  const [summary, setSummary] = useState<SocialSummary | null>(null);
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [settings, setSettings] = useState<SocialSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [accountForm, setAccountForm] = useState(emptyAccountForm);
  const [postForm, setPostForm] = useState(emptyPostForm);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [postStatusFilter, setPostStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      params.set('limit', '20');
      if (postStatusFilter) params.set('status', postStatusFilter);
      if (search) params.set('search', search);

      const [summaryData, accountsData, postsData, settingsData] = await Promise.all([
        apiClient<SocialSummary>('/api/social-media/summary'),
        apiClient<ListResponse<SocialAccount>>('/api/social-media/accounts?limit=50'),
        apiClient<ListResponse<SocialPost>>(`/api/social-media/posts?${params.toString()}`),
        apiClient<SocialSettings>('/api/social-media/settings'),
      ]);
      setSummary(summaryData);
      setAccounts(accountsData.data ?? []);
      setPosts(postsData.data ?? []);
      setSettings(settingsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load social media module.');
    } finally {
      setLoading(false);
    }
  }, [postStatusFilter, search]);

  useEffect(() => {
    void load();
  }, [load]);

  const defaultHashtags = useMemo(() => {
    if (!settings || !Array.isArray(settings.defaultHashtagsJson)) return '';
    return settings.defaultHashtagsJson.join(', ');
  }, [settings]);

  function resetAccountForm() {
    setEditingAccountId(null);
    setAccountForm(emptyAccountForm);
  }

  function resetPostForm() {
    setEditingPostId(null);
    setPostForm(emptyPostForm);
  }

  function startEditAccount(account: SocialAccount) {
    setActiveTab('accounts');
    setEditingAccountId(account.id);
    setAccountForm({
      platformKey: account.platformKey,
      accountName: account.accountName,
      accountHandle: account.accountHandle ?? '',
      profileUrl: account.profileUrl ?? '',
      profileImageUrl: account.profileImageUrl ?? '',
      status: account.status,
    });
  }

  function startEditPost(post: SocialPost) {
    setActiveTab('posts');
    setEditingPostId(post.id);
    setPostForm({
      title: post.title,
      content: post.content,
      linkUrl: post.linkUrl ?? '',
      hashtagsText: Array.isArray(post.hashtagsJson) ? post.hashtagsJson.join(', ') : '',
      scheduledAt: post.scheduledAt ? toDateTimeLocal(post.scheduledAt) : '',
      accountIds: post.targets.map((target) => target.socialAccount.id),
    });
  }

  async function handleSaveAccount() {
    if (!accountForm.platformKey.trim() || !accountForm.accountName.trim()) {
      setError('Platform and account name are required.');
      return;
    }
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const payload = {
        ...accountForm,
        platformKey: accountForm.platformKey.trim().toLowerCase(),
        accountName: accountForm.accountName.trim(),
        accountHandle: accountForm.accountHandle.trim() || undefined,
        profileUrl: accountForm.profileUrl.trim() || undefined,
        profileImageUrl: accountForm.profileImageUrl.trim() || undefined,
      };
      await apiClient(
        editingAccountId
          ? `/api/social-media/accounts/${editingAccountId}`
          : '/api/social-media/accounts',
        {
          body: JSON.stringify(payload),
          method: editingAccountId ? 'PUT' : 'POST',
        },
      );
      setMessage(editingAccountId ? 'Social account updated.' : 'Social account created.');
      resetAccountForm();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save social account.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAccount(account: SocialAccount) {
    if (!confirm(`Delete ${account.accountName}?`)) return;
    setSaving(true);
    setError('');
    setMessage('');
    try {
      await apiClient(`/api/social-media/accounts/${account.id}`, { method: 'DELETE' });
      setMessage('Social account deleted.');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete social account.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSavePost() {
    if (!postForm.title.trim() || !postForm.content.trim()) {
      setError('Title and content are required.');
      return;
    }
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const payload = {
        title: postForm.title.trim(),
        content: postForm.content.trim(),
        linkUrl: postForm.linkUrl.trim() || undefined,
        hashtags: splitCsv(postForm.hashtagsText),
        accountIds: postForm.accountIds,
        scheduledAt: postForm.scheduledAt ? new Date(postForm.scheduledAt).toISOString() : undefined,
      };
      await apiClient(
        editingPostId ? `/api/social-media/posts/${editingPostId}` : '/api/social-media/posts',
        {
          body: JSON.stringify(payload),
          method: editingPostId ? 'PUT' : 'POST',
        },
      );
      setMessage(editingPostId ? 'Social post updated.' : 'Social post created.');
      resetPostForm();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save social post.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeletePost(post: SocialPost) {
    if (!confirm(`Delete ${post.title}?`)) return;
    await runPostAction(post.id, 'DELETE', 'deleted');
  }

  async function runPostAction(id: string, action: string, doneLabel: string) {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      if (action === 'DELETE') {
        await apiClient(`/api/social-media/posts/${id}`, { method: 'DELETE' });
      } else {
        await apiClient(`/api/social-media/posts/${id}/${action}`, { method: 'POST' });
      }
      setMessage(`Social post ${doneLabel}.`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update social post.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveSettings(nextSettings: SocialSettings) {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const payload = {
        isEnabled: nextSettings.isEnabled,
        autoPostBlogsEnabled: nextSettings.autoPostBlogsEnabled,
        autoPostNewsroomEnabled: nextSettings.autoPostNewsroomEnabled,
        autoPostAnnouncementsEnabled: nextSettings.autoPostAnnouncementsEnabled,
        requireApprovalBeforeSocialPost: nextSettings.requireApprovalBeforeSocialPost,
        defaultHashtags: splitCsv(defaultHashtags),
        maxRetries: Number(nextSettings.maxRetries),
        retryBackoffSeconds: Number(nextSettings.retryBackoffSeconds),
      };
      await apiClient('/api/social-media/settings', {
        body: JSON.stringify(payload),
        method: 'PUT',
      });
      setMessage('Social media settings saved.');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save settings.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Social Media</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage social accounts and prepare posts for publishing.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setActiveTab('posts');
            resetPostForm();
          }}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          New Post
        </button>
      </div>

      {summary && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Accounts" value={summary.accounts} />
          <StatCard label="Connected" value={summary.connectedAccounts} tone="emerald" />
          <StatCard label="Draft Posts" value={summary.draftPosts} tone="amber" />
          <StatCard label="Published" value={summary.publishedPosts} tone="blue" />
        </div>
      )}

      {(message || error) && (
        <div
          className={[
            'rounded-md border px-4 py-3 text-sm',
            error ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700',
          ].join(' ')}
        >
          {error || message}
        </div>
      )}

      <div className="flex flex-wrap gap-2 border-b">
        <TabButton active={activeTab === 'posts'} onClick={() => setActiveTab('posts')}>
          Posts
        </TabButton>
        <TabButton active={activeTab === 'accounts'} onClick={() => setActiveTab('accounts')}>
          Accounts
        </TabButton>
        <TabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')}>
          Settings
        </TabButton>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 rounded-md border bg-card px-4 py-8 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading social media module
        </div>
      ) : activeTab === 'posts' ? (
        <section className="grid gap-6 xl:grid-cols-[420px_1fr]">
          <div className="rounded-md border bg-card p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-semibold">{editingPostId ? 'Edit post' : 'Create post'}</h2>
                <p className="text-xs text-muted-foreground">Compose once and target one or more accounts.</p>
              </div>
              {editingPostId && (
                <button type="button" onClick={resetPostForm} className="text-xs text-muted-foreground hover:text-foreground">
                  Cancel
                </button>
              )}
            </div>
            <div className="space-y-3">
              <Field label="Title">
                <input
                  value={postForm.title}
                  onChange={(event) => setPostForm((prev) => ({ ...prev, title: event.target.value }))}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  placeholder="Website update"
                />
              </Field>
              <Field label="Content">
                <textarea
                  value={postForm.content}
                  onChange={(event) => setPostForm((prev) => ({ ...prev, content: event.target.value }))}
                  className="min-h-32 w-full rounded-md border bg-background px-3 py-2 text-sm"
                  placeholder="Write the social caption"
                />
              </Field>
              <Field label="Link URL">
                <input
                  value={postForm.linkUrl}
                  onChange={(event) => setPostForm((prev) => ({ ...prev, linkUrl: event.target.value }))}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  placeholder="https://example.com/news"
                />
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Hashtags">
                  <input
                    value={postForm.hashtagsText}
                    onChange={(event) => setPostForm((prev) => ({ ...prev, hashtagsText: event.target.value }))}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    placeholder="cms, update"
                  />
                </Field>
                <Field label="Schedule">
                  <input
                    type="datetime-local"
                    value={postForm.scheduledAt}
                    onChange={(event) => setPostForm((prev) => ({ ...prev, scheduledAt: event.target.value }))}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  />
                </Field>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium">Accounts</p>
                <div className="space-y-2 rounded-md border bg-background p-3">
                  {accounts.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Create an account before assigning targets.</p>
                  ) : (
                    accounts.map((account) => (
                      <label key={account.id} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={postForm.accountIds.includes(account.id)}
                          onChange={(event) =>
                            setPostForm((prev) => ({
                              ...prev,
                              accountIds: event.target.checked
                                ? [...prev.accountIds, account.id]
                                : prev.accountIds.filter((id) => id !== account.id),
                            }))
                          }
                        />
                        <span>{account.accountName}</span>
                        <span className="text-xs text-muted-foreground">({account.platformKey})</span>
                      </label>
                    ))
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={handleSavePost}
                disabled={saving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-60"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingPostId ? 'Save Post' : 'Create Draft'}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                placeholder="Search posts"
              />
              <select
                value={postStatusFilter}
                onChange={(event) => setPostStatusFilter(event.target.value)}
                className="rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="">All statuses</option>
                {Object.entries(postStatusLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            {posts.length === 0 ? (
              <EmptyState icon={<Share2 className="h-8 w-8" />} text="No social posts found." />
            ) : (
              posts.map((post) => (
                <div key={post.id} className="rounded-md border bg-card p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">{post.title}</h3>
                        <StatusBadge status={post.status} labels={postStatusLabels} />
                      </div>
                      <p className="line-clamp-2 text-sm text-muted-foreground">{post.content}</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Targets: {post.targets.length || 0} - Updated {formatDate(post.updatedAt)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <IconButton title="Edit" onClick={() => startEditPost(post)}>
                        <Pencil className="h-4 w-4" />
                      </IconButton>
                      {post.status === 'SOCIAL_POST_DRAFT' && (
                        <IconButton title="Submit" onClick={() => runPostAction(post.id, 'submit', 'submitted')}>
                          <Send className="h-4 w-4" />
                        </IconButton>
                      )}
                      {['SOCIAL_POST_DRAFT', 'SOCIAL_POST_PENDING_APPROVAL'].includes(post.status) && (
                        <IconButton title="Approve" onClick={() => runPostAction(post.id, 'approve', 'approved')}>
                          <CheckCircle2 className="h-4 w-4" />
                        </IconButton>
                      )}
                      {['SOCIAL_POST_APPROVED', 'SOCIAL_POST_QUEUED'].includes(post.status) && (
                        <IconButton title="Publish" onClick={() => runPostAction(post.id, 'publish', 'published')}>
                          <Rocket className="h-4 w-4" />
                        </IconButton>
                      )}
                      {!['SOCIAL_POST_PUBLISHED', 'SOCIAL_POST_CANCELLED'].includes(post.status) && (
                        <IconButton title="Cancel" onClick={() => runPostAction(post.id, 'cancel', 'cancelled')}>
                          <XCircle className="h-4 w-4" />
                        </IconButton>
                      )}
                      <IconButton title="Delete" onClick={() => handleDeletePost(post)}>
                        <Trash2 className="h-4 w-4" />
                      </IconButton>
                    </div>
                  </div>
                  {post.targets.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {post.targets.map((target) => (
                        <span
                          key={target.id}
                          className="rounded-full border bg-background px-2.5 py-1 text-xs text-muted-foreground"
                        >
                          {target.socialAccount.accountName} - {target.status.replace('TARGET_', '').toLowerCase()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      ) : activeTab === 'accounts' ? (
        <section className="grid gap-6 xl:grid-cols-[420px_1fr]">
          <div className="rounded-md border bg-card p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-semibold">{editingAccountId ? 'Edit account' : 'Add account'}</h2>
                <p className="text-xs text-muted-foreground">Manual account records for MVP publishing.</p>
              </div>
              {editingAccountId && (
                <button type="button" onClick={resetAccountForm} className="text-xs text-muted-foreground hover:text-foreground">
                  Cancel
                </button>
              )}
            </div>
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Platform">
                  <input
                    value={accountForm.platformKey}
                    onChange={(event) => setAccountForm((prev) => ({ ...prev, platformKey: event.target.value }))}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    placeholder="linkedin"
                  />
                </Field>
                <Field label="Status">
                  <select
                    value={accountForm.status}
                    onChange={(event) => setAccountForm((prev) => ({ ...prev, status: event.target.value }))}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  >
                    {Object.entries(accountStatusLabels).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field label="Account Name">
                <input
                  value={accountForm.accountName}
                  onChange={(event) => setAccountForm((prev) => ({ ...prev, accountName: event.target.value }))}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  placeholder="Official LinkedIn"
                />
              </Field>
              <Field label="Handle">
                <input
                  value={accountForm.accountHandle}
                  onChange={(event) => setAccountForm((prev) => ({ ...prev, accountHandle: event.target.value }))}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  placeholder="@your-handle"
                />
              </Field>
              <Field label="Profile URL">
                <input
                  value={accountForm.profileUrl}
                  onChange={(event) => setAccountForm((prev) => ({ ...prev, profileUrl: event.target.value }))}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  placeholder="https://www.linkedin.com/company/example"
                />
              </Field>
              <Field label="Profile Image URL">
                <input
                  value={accountForm.profileImageUrl}
                  onChange={(event) => setAccountForm((prev) => ({ ...prev, profileImageUrl: event.target.value }))}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  placeholder="https://example.com/logo.png"
                />
              </Field>
              <button
                type="button"
                onClick={handleSaveAccount}
                disabled={saving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-60"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingAccountId ? 'Save Account' : 'Add Account'}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {accounts.length === 0 ? (
              <EmptyState icon={<Share2 className="h-8 w-8" />} text="No social accounts added." />
            ) : (
              accounts.map((account) => (
                <div key={account.id} className="flex flex-col gap-3 rounded-md border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{account.accountName}</h3>
                      <StatusBadge status={account.status} labels={accountStatusLabels} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {account.platformKey}
                      {account.accountHandle ? ` - ${account.accountHandle}` : ''}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <IconButton title="Edit" onClick={() => startEditAccount(account)}>
                      <Pencil className="h-4 w-4" />
                    </IconButton>
                    <IconButton title="Delete" onClick={() => handleDeleteAccount(account)}>
                      <Trash2 className="h-4 w-4" />
                    </IconButton>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      ) : (
        settings && (
          <section className="max-w-3xl rounded-md border bg-card p-4">
            <div className="mb-4 flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              <div>
                <h2 className="font-semibold">Social media settings</h2>
                <p className="text-xs text-muted-foreground">Control approval and automation defaults.</p>
              </div>
            </div>
            <div className="space-y-4">
              <ToggleRow
                label="Enable social media module"
                checked={settings.isEnabled}
                onChange={(value) => setSettings((prev) => (prev ? { ...prev, isEnabled: value } : prev))}
              />
              <ToggleRow
                label="Require approval before publishing"
                checked={settings.requireApprovalBeforeSocialPost}
                onChange={(value) =>
                  setSettings((prev) => (prev ? { ...prev, requireApprovalBeforeSocialPost: value } : prev))
                }
              />
              <ToggleRow
                label="Auto-post blogs"
                checked={settings.autoPostBlogsEnabled}
                onChange={(value) => setSettings((prev) => (prev ? { ...prev, autoPostBlogsEnabled: value } : prev))}
              />
              <ToggleRow
                label="Auto-post newsroom"
                checked={settings.autoPostNewsroomEnabled}
                onChange={(value) =>
                  setSettings((prev) => (prev ? { ...prev, autoPostNewsroomEnabled: value } : prev))
                }
              />
              <ToggleRow
                label="Auto-post announcements"
                checked={settings.autoPostAnnouncementsEnabled}
                onChange={(value) =>
                  setSettings((prev) => (prev ? { ...prev, autoPostAnnouncementsEnabled: value } : prev))
                }
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Max Retries">
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={settings.maxRetries}
                    onChange={(event) =>
                      setSettings((prev) => (prev ? { ...prev, maxRetries: Number(event.target.value) } : prev))
                    }
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  />
                </Field>
                <Field label="Retry Backoff Seconds">
                  <input
                    type="number"
                    min={5}
                    max={3600}
                    value={settings.retryBackoffSeconds}
                    onChange={(event) =>
                      setSettings((prev) =>
                        prev ? { ...prev, retryBackoffSeconds: Number(event.target.value) } : prev,
                      )
                    }
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  />
                </Field>
              </div>
              <Field label="Default Hashtags">
                <input
                  value={defaultHashtags}
                  onChange={(event) =>
                    setSettings((prev) =>
                      prev ? { ...prev, defaultHashtagsJson: splitCsv(event.target.value) } : prev,
                    )
                  }
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  placeholder="cms, update"
                />
              </Field>
              <button
                type="button"
                onClick={() => handleSaveSettings(settings)}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-60"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                Save Settings
              </button>
            </div>
          </section>
        )
      )}
    </div>
  );
}

function StatCard({ label, value, tone = 'default' }: { label: string; value: number; tone?: 'default' | 'emerald' | 'amber' | 'blue' }) {
  const toneClass =
    tone === 'emerald' ? 'text-emerald-600' : tone === 'amber' ? 'text-amber-600' : tone === 'blue' ? 'text-blue-600' : '';
  return (
    <div className="rounded-md border bg-card p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={['mt-1 text-2xl font-bold', toneClass].join(' ')}>{value}</p>
    </div>
  );
}

function TabButton({ active, children, onClick }: { active: boolean; children: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'border-b-2 px-4 py-2 text-sm font-medium',
        active ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

function Field({ children, label }: { children: ReactNode; label: string }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}

function IconButton({ children, onClick, title }: { children: ReactNode; onClick: () => void; title: string }) {
  return (
    <button
      type="button"
      aria-label={title}
      title={title}
      onClick={onClick}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border bg-background text-muted-foreground hover:text-foreground"
    >
      {children}
    </button>
  );
}

function StatusBadge({ status, labels }: { status: string; labels: Record<string, string> }) {
  return (
    <span className={['rounded-full border px-2 py-0.5 text-xs font-medium', badgeClasses[status] ?? 'bg-gray-50 text-gray-700'].join(' ')}>
      {labels[status] ?? status}
    </span>
  );
}

function EmptyState({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-md border bg-card px-4 py-12 text-center text-muted-foreground">
      {icon}
      <p className="mt-3 text-sm">{text}</p>
    </div>
  );
}

function ToggleRow({ checked, label, onChange }: { checked: boolean; label: string; onChange: (value: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-md border bg-background px-3 py-2 text-sm">
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    </label>
  );
}

function splitCsv(value: string) {
  return value
    .split(',')
    .map((item) => item.trim().replace(/^#/, ''))
    .filter(Boolean);
}

function toDateTimeLocal(value: string) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString();
}
