# Social Media Publishing

## Purpose

The Social Media module lets authenticated CMS users manage social accounts and prepare posts for publication from the admin panel.

## Current MVP Scope

- Manage social accounts manually.
- Create and edit social posts.
- Attach one or more account targets to a post.
- Submit, approve, queue, publish, cancel, and soft delete posts.
- Store publish logs and audit logs.
- Manage approval and automation settings.

External social network API calls are not implemented yet. The current `publish` action writes a simulated publish log so the workflow can be tested safely.

## Backend

NestJS module:

```text
apps/api/src/social-media
```

Database tables:

```text
social_accounts
social_posts
social_post_targets
social_publish_logs
social_settings
```

## Admin UI

Admin route:

```text
apps/admin-web/src/app/social-media
```

The screen contains tabs for posts, accounts, and settings.

## Permissions

```text
Super Admin / Admin: manage accounts, posts, settings, and publish actions.
Editor / Publisher: view and create/update social posts.
Publisher: approve, queue, publish, and cancel social posts.
```

## Future Provider Upgrade

Add a provider abstraction such as:

```text
SocialPublisherProvider.publish(target, post)
```

Then map `platformKey` values like `linkedin`, `facebook`, and `x` to concrete provider implementations. Keep access tokens encrypted and never return tokens to the frontend.
