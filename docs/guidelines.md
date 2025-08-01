# Guidelines

Note: These guidelines were created during the Capstone project, but not all development (especially after the Capstone project) has been following them. They are also not up-to-date anyway (example: `STYLE_GUIDE.md` and `dev` branch do not exist). The advice for feature version labels has not been applied. Consistent standards should be established.

## Using Git Collaboratively

- We are using Git to track and store different versions of the project as we add features.
- Each new feature or update will have a version label, for example: `V.1 - Server Connected`, `V.2 - Call Feature`
- This allows us to roll back or track changes easily. You will be given instructions on pulling and pushing changes when necessary.
- Before making any changes, pull the latest updates from GitHub:
`git pull origin main`
- Start working on a feature by creating a new branch:
`git checkout -b feat/feature-name`
- Once the feature works, commit and push it:
`git add .`
`git commit -m "feat: Implemented Feature XYZ"`
`git push origin feat/feature-name`
- Once you confirmed the feature to be stable, merge the branch into testing. This way, we can work our way piecemeal to the finished product.

## Branch Naming

### Feature: `feat/<description>`

- Example: `feat/user-sign-up`

### Bug Fix: `fix/<description>`

- Example: `fix/sign-up-crash` 

### Hotfix: `hotfix/<description>`

- Example: `hotfix/login-issue-hotfix`

### Other: `chore/<description>`

- Example: `chore/update-contributing.md`

## Commit Message Guidelines

### Template: `<type>: <short description>`

### Types:

- `feat`: new feature
- `fix`: bug fix
- `docs`: documentation changes
- `style`: code style changes, formatting, missing semicolons, etc.
- `test`: Adding or updating tests
- `chore`: Dependency updates or changes`

### Examples:

- `feat: add user login function`
- `fix: properly logs the logs the document` (???)
- `docs: fixing the branch names`

## Pull Request (PR) Guidelines

- Create PR against the `dev` branch
- Provide clear title and description of the changes:
	- Address the problem in PR
	- Include steps to verify changes changes if needed
- All tests must pass before submitting PR
- Tag reviewers if needed
- Follow branch naming and commit message guidelines

### PR Example:

Title: `fix: resolve error on login`

Description:

```md
- Fix null pointer on logging in
- Fix password input errors
```

## PR/Code Review

- Make sure `STYLE_GUIDE.md` is being followed when writing code
- Check for clear and descriptive commit messages
- Make sure no console logs or debug statements
- Verify all new functionality is tested and documented if necessary
