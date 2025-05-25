# Guidelines

## Branch Naming

### Feature: `feat/<description>`

### Example: `feat/user-sign-up`
<br>

### Bug Fix: `fix/<description>`

### Example: `fix/sign-up-crash`
<br>
  

### Hotfix: `hotfix/<description>`

### Example: `hotfix/login-issue-hotfix`

  <br>

### Other: `chore/<description>`

### Example: `chore/update-contributing.md`

<br>
  

## Commit Message Guidelines

### Template: `<type>: <short description>`

### Types:
```
- feat: new feature

- fix: bug fix

- docs: documentation changes

- style: code style changes, formatting, missing semicolons, etc.

- test: Adding or updating tests

- chore: Dependency updates or changes`
```

### Example: `feat: add user login function`
### Example: `fix: properly logs the logs the document`
### Example: `docs: fixing the branch names`
<br>

## Pull Request (PR) Guidelines
1. Create PR against the `dev` branch
2. Provide clear title and description of the changes:
	   - address the problem in PR
	   - Include steps to verify changes changes if needed
3. All tests must pass before submitting PR.
4. Tag reviewers if needed
5. Follow branch naming and commit message guidelines

### PR Example:
Title: `fix: resolve error on login`
Description:
```
- Fix null pointer on logging in
- Fix password input errors
```
## PR/Code Review
- Make sure `STYLE_GUIDE.md` is being followed when writing code
- Check for clear and descriptive commit messages
-  Make sure no console logs or debug statements
- Verify all new functionality is tested and documented if necessary
