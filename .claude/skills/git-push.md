# git-push

Stage changed files, commit with a descriptive message, and push to the remote.

## Steps

1. Show what will be committed:
   ```bash
   git -C /home/amit/Music/website/aw-project status
   git -C /home/amit/Music/website/aw-project diff --stat
   ```

2. Ask the user for a commit message if they didn't provide one as an argument to this skill. Do not guess or invent a message without asking.

3. Stage and commit:
   ```bash
   git -C /home/amit/Music/website/aw-project add <specific files — never -A blindly>
   git -C /home/amit/Music/website/aw-project commit -m "<message>"
   ```

4. Push to the current branch:
   ```bash
   git -C /home/amit/Music/website/aw-project push
   ```

5. Report success and the commit hash.

## Rules

- Never use `--no-verify` or `--force` unless the user explicitly requests it.
- Never commit `.env` files or secrets.
- If the push is rejected (non-fast-forward), report it and ask the user how to proceed — do not rebase or force-push automatically.
- If the user passes a message as an argument (e.g. `/git-push "fix login bug"`), use it directly without prompting.
