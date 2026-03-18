# Administration

## User Management

The **Users** section in the navigation menu (visible to super users only) provides a management interface for controlling who can access the FireFly management console.

### Adding the First Super User

The first super user cannot be invited through the UI because the UI itself requires authentication.  Bootstrap the first account manually:

1. Go to **DynamoDB** → `firefly-users` table → **Create item** and add a record with:
   ```json
   {
     "email": "user@example.com",
     "environments": ["dev", "production"],
     "invited_by": "system",
     "created_at": "2026-01-01T00:00:00+00:00"
   }
   ```
2. Sign in using **Sign in with Google** with the Google account that matches the email address above.  Cognito will create a federated user (username prefixed with `Google_`) on first sign-in.
3. Open the [AWS Cognito console](https://console.aws.amazon.com/cognito) and select the `firefly-user-pool` User Pool.
4. Go to **Users** and find the newly-created `Google_` prefixed user for the account.
5. Go to **Groups** → `super_users` → **Add user** and add that `Google_` user.
6. Sign out and sign back in.  The session must be refreshed for the new group membership to appear in the token.

::: warning Do not create a local Cognito user
Do not manually create a local Cognito user for the super user's email address.  A local user with the same email as a Google-federated user will cause an "Attribute cannot be updated" error on sign-in.  All users must sign in exclusively through Google.
:::

### Inviting Users

Once at least one super user exists, subsequent users are invited through the UI:

1. Sign in to the management console.
2. Open the hamburger menu and select **Users**.
3. Click **Invite User**.
4. Enter the user's Google email address.
5. Select the environments they should have access to (`dev`, `production`, or both).
6. Click **Add User**.
7. Tell the user out-of-band that they can now sign in using the **Sign in with Google** button.

The user's email is added to the allowed list.  The next time they attempt to sign in with Google, the [pre-signup Lambda](/cloud/lambdas/func-cognito-pre-signup) will permit their account to be created.

::: info No invitation email is sent
FireFly does not send invitation emails.  You must notify the user directly that access has been granted.
:::

### Managing Super Users

Any super user can promote or demote another user.  To change a user's super status:

1. Go to **Users** in the navigation menu.
2. Find the user and click **Make super** or **Revoke super**.
3. Confirm the action in the confirmation dialog.

::: warning Last super user protection
The last super user cannot be demoted or deleted.  At least one super user must always exist.
:::

### Deleting Users

To remove a user's access:

1. Go to **Users** in the navigation menu.
2. Find the user and click **Delete**.
3. Confirm the deletion.

The user is removed from both the Cognito User Pool and the allowed list.  Any active sessions will expire within 1 hour (the access token lifetime).  If the user is a super user, they cannot be deleted if they are the last remaining super user.

### Environment Access

Each user is granted access to one or more environments at invite time.  A user with `dev` access can only sign in to the `dev` environment; a user with `production` access can only sign in to the `production` environment.  Access to both environments can be granted simultaneously.

::: info Changing environments after invite
To modify an existing user's environment access, delete the user and re-invite them with the updated environment selection.
:::
