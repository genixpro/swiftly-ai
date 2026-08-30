# Security release checklist

The active modern runtime has no tracked credentials. Before publishing it, the repository owner must complete the following external actions:

1. Revoke and replace the historical Google Maps credential exposed by commit `c8644cf` (`Updating my google maps API key`). Treat any other historic cloud/auth credentials as compromised as well.
2. Protect the current working tree: commit or stash the modernization work on a new branch before changing Git history.
3. Publish from a new clean repository, or have an owner rewrite every reachable branch and tag with a reviewed history-rewrite tool. Verify the rewritten clone with secret scanning before force-pushing, then delete every obsolete remote ref.
4. Ask the hosting provider to purge cached or unreachable objects from the prior history. A force-push removes public refs but does not guarantee immediate object deletion from provider retention systems.
5. Rotate deploy keys, CI secrets, OAuth/Auth0 credentials, storage credentials, and API keys in their providers. Do not reuse values removed from the repository.
5. Force-push rewritten references only after notifying all collaborators, then require fresh clones and invalidate old deployment artifacts.

This checklist deliberately contains no historical secret values. The local demo needs only runtime `.env` values; `OPENAI_API_KEY` is optional and is never committed.
