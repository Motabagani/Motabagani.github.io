# Hashim Motabagani — Portfolio

A bilingual personal portfolio built with React and Vite. The site uses hash
routing, so it works on GitHub Pages without server-side route rewrites.

## Local development

```sh
npm install
npm run dev
```

## Deploy to GitHub Pages

1. Create a GitHub repository and push this folder to its `main` branch.
2. Open **Settings → Pages** in the repository.
3. Under **Build and deployment**, choose **GitHub Actions** as the source.
4. Run the **Deploy portfolio to GitHub Pages** workflow, or push another
   commit to `main`.

The workflow installs dependencies, builds the Vite app, and publishes `dist/`.
Relative asset URLs allow either a user-site repository (`Motabagani.github.io`)
or a project-site repository such as `portfolio`.

## Important hosting note

GitHub Pages hosts static files only. The portfolio pages, links, animations,
and browser-based demos work there, but the former NYU Python CGI contact and
feedback backend in `server/` cannot run on GitHub Pages. Configure a separate
form/API service before relying on those submissions.
