Musify TV — Music Player for Samsung Smart TVs (Tizen 4.0)

A TV adaptation of "Musify" (https://github.com/gokadzev/Musify), built specifically for older Samsung Smart TVs.

Device| Samsung UA32N5300 (2018 model)
Platform| Tizen 4.0
Browser engine| Chromium 56 (M56)

Why not Flutter?

The original Musify application is built with Flutter. However, "flutter-tizen" only supports Tizen 6.0 and newer, which means it cannot run on this 2018 Samsung TV.

Instead of trying to force Flutter to work on an unsupported platform, Musify TV has been rebuilt as a native Tizen Web application (".wgt").

The application uses JavaScript ES5 and Flexbox, keeping compatibility with the TV's older Chromium 56 browser.

Every build automatically runs compatibility checks to prevent the use of unsupported features, including CSS Grid, CSS "gap", "async/await", and the Fetch API.

Features

The goal is to bring as much of the original Musify experience as possible to Samsung TVs.

- Music search: Search for tracks with suggestions.
- Playback controls: Play, pause, skip, go back, shuffle, and repeat.
- Queue management: Manage upcoming tracks and control playback order.
- Favorites and history: Keep track of liked songs and recently played music.
- Custom playlists: Create and manage personal playlists.
- YouTube playlist import: Import playlists using a YouTube URL.
- Lyrics: Display synchronized lyrics when available.
- Radio mode: Automatically discover and play similar songs.
- Languages: English and Arabic, including RTL layout support.
- Themes: Customize the application's appearance.
- Remote control support: Use the Samsung TV remote for playback and navigation.

Remote control shortcuts

Button| Action
Play / Pause| Control playback
Next / Previous| Change tracks
Fast Forward / Rewind| Seek through a track
Red| Like the current song
Green| Open the Now Playing screen
Arrow keys| Navigate the interface
OK| Select an item
Back| Go back (press twice to exit)
Left / Right on progress bar| Seek ±10 seconds
Three-dot menu| Open track options

Features that cannot be carried over

Some features from the original Android application depend on operating system permissions or APIs that are not available to Tizen 4.0 web applications.

These limitations are imposed by the TV platform, not by the JavaScript implementation.

The following features are therefore excluded:

- Offline downloads and playback.
- Built-in audio equalizer.
- Local synchronization between devices.
- Sharing music links directly from a phone.
- Spotify playlist imports.
- Material You dynamic theming.
- Built-in application updater.

Music sources and lyrics

Musify TV uses public Piped API instances to retrieve music data and stream audio.

The application includes:

- Automatic server switching when an instance becomes unavailable.
- The ability to refresh the server list from Settings.
- Support for manually adding a custom Piped server.
- LRCLIB integration for retrieving synchronized lyrics.

Public Piped instances are not guaranteed to remain available. They may become unavailable, blocked, or overloaded.

For a more reliable experience, you can host your own Piped instance and add its address through:

Settings → Server → Add Server

Project structure

src/
├── config.xml
├── index.html
├── js/
└── css/

scripts/
├── check-compat.js
└── smoke-test.js

.github/
└── workflows/
    └── build-tizen.yml

docs/
└── PLAN.md

- "src/" — Main Tizen application.
- "scripts/check-compat.js" — Checks compatibility with Chromium 56.
- "scripts/smoke-test.js" — Runs basic application logic tests.
- ".github/workflows/build-tizen.yml" — Builds and packages the Tizen application.
- "docs/PLAN.md" — Final project implementation plan.

Building and installing

1. Upload the project to GitHub

Extract the project files, open a terminal in the project directory, and run:

git init
git add .
git commit -m "Initial Musify TV release"
git branch -M main
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main

Make sure to include the "LICENSE" file from the original Musify repository, as described in "NOTICE.md".

2. Generate a Samsung developer certificate

This step is mandatory. Tizen 4.0 TVs require a Samsung-signed package with a distributor certificate associated with the TV's DUID.

GitHub Actions cannot generate this certificate on your behalf.

1. On your TV, open Apps.
2. Press "1 2 3 4 5" on the remote.
3. Enable Developer Mode and enter your computer's IP address.
4. Restart the TV.
5. Install Tizen Studio on your computer, including:
   - TV Extensions.
   - Samsung Certificate Extension.
6. Open Device Manager and connect to your TV:

sdb connect <TV_IP>

7. Open Certificate Manager and create a new Samsung TV certificate.
8. Sign in with your Samsung account and select your registered TV.

After completing the process, you should have:

author.p12
distributor.p12

These files are normally stored under:

~/SamsungCertificate/<certificate-name>/

3. Configure GitHub Actions secrets

Your certificate files must be converted to Base64 before uploading them to GitHub.

Run:

base64 -w0 author.p12
base64 -w0 distributor.p12

Go to:

GitHub → Repository → Settings → Secrets and variables → Actions

Add the following repository secrets:

Secret| Value
"TIZEN_AUTHOR_P12_B64"| Base64 content of "author.p12"
"TIZEN_DISTRIBUTOR_P12_B64"| Base64 content of "distributor.p12"
"TIZEN_AUTHOR_PASSWORD"| Author certificate password
"TIZEN_DISTRIBUTOR_PASSWORD"| Distributor certificate password

If these secrets are not configured, the workflow will still generate a ".wgt" package using a temporary certificate for build verification. It will also upload "MusifyTV-source.zip", which can be packaged and signed locally using your own certificate.

4. Build the application

Open the repository's Actions tab and run:

Build Tizen TV app

Alternatively, push a version tag to trigger a release:

git tag v1.0.0
git push origin v1.0.0

Once the workflow finishes, download the generated artifact.

5. Install the application on your TV

Connect to the TV:

sdb connect <TV_IP>

Install the package:

tizen install -n MusifyTV.wgt -t <DEVICE_NAME>

Launch it:

tizen run -p MusifyTV01.MusifyTV -t <DEVICE_NAME>

Replace "<DEVICE_NAME>" with the device name reported by:

sdb devices

You can also import the "src/" directory as a Tizen Web project in Tizen Studio and run it directly on the TV.

Troubleshooting

Connection errors or an error screen

Try switching to another Piped instance through Settings. Also check that the TV's date and time are correct, as incorrect system time can cause HTTPS certificate validation failures. Updating the TV firmware may also help.

Invalid certificate during installation

The package was not signed with a valid Samsung distributor certificate associated with your TV. Review the certificate generation and GitHub secrets configuration steps.

A particular song has no audio

The application attempts another available audio format before moving to the next track. If the problem affects multiple songs, the selected Piped instance may be blocked or unavailable.

GitHub Actions requests a password during "tizen package"

Try running the job again. If the issue persists, inspect the logs for the "Package .wgt" step.

Testing and compatibility

The project has undergone automated source-code compatibility checks targeting Chromium 56.

The following areas have also been tested:

- Network and server switching logic.
- Audio format selection and fallback.
- Playlist and library management.
- Interface rendering.
- Arrow-key navigation using desktop Chromium with a simulated network environment.

Testing limitations: The application has not yet been tested on an actual Samsung TV, and the GitHub Actions workflow has not been executed. Development took place in an environment without internet access.

The first installation may require minor adjustments, particularly if Samsung changes its download or certificate-related endpoints.

License

GPL-3.0.

See "NOTICE.md" for additional licensing information and attribution to the original Musify project.