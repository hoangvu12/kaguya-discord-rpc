const { ipcRenderer } = require("electron");

(() => {
  const webview = document.querySelector("webview");
  let oldEvent = null;
  let timestamp = new Date();

  const MEDIA_UNIT_REGEX = /\((.*?)\)/;

  const isNumberOnly = (str) => /^\d+$/.test(str);

  const events = [
    {
      name: "watching",
      match: (url) => url.includes("/anime/watch"),
      createActivity(_, fullTitle) {
        const [title] = fullTitle.split(" - Kaguya");

        if (!MEDIA_UNIT_REGEX.test(title)) return;

        let episode = title.match(MEDIA_UNIT_REGEX)[1];

        if (isNumberOnly(episode)) {
          episode = "Episode " + episode;
        }

        const animeTitle = title.replace(MEDIA_UNIT_REGEX, "");

        return {
          details: animeTitle,
          state: episode,
          largeImageKey: "watching",
          largeImageText: `Watching ${animeTitle}`,
        };
      },
    },
    {
      name: "reading",
      match: (url) => url.includes("/manga/read"),
      createActivity(_, fullTitle) {
        const [title] = fullTitle.split(" - Kaguya");

        if (!MEDIA_UNIT_REGEX.test(title)) return;

        let chapter = title.match(MEDIA_UNIT_REGEX)[1];

        if (isNumberOnly(chapter)) {
          chapter = "Chapter " + chapter;
        }

        const mangaTitle = title.replace(MEDIA_UNIT_REGEX, "");

        return {
          details: mangaTitle,
          state: chapter,
          largeImageKey: "reading",
          largeImageText: `Reading ${mangaTitle}`,
        };
      },
    },
    {
      name: "idling",
      match: () => true,
      createActivity() {
        return {
          details: `Idling`,
          largeImageKey: "idling",
          largeImageText:
            "If there was an award for laziness, I'd probably send someone to pick it up for me.",
        };
      },
    },
  ];

  const listenPageChange = () => {
    const updateActivity = () => {
      const url = webview.getURL();
      const title = webview.getTitle();

      const event = events.find((event) => event.match(url));

      if (oldEvent?.name !== event.name) {
        timestamp = new Date();
      }

      const activity = event.createActivity(url, title);

      if (!activity) return;

      setActivity(activity);

      oldEvent = event;
    };

    webview.addEventListener("did-navigate-in-page", updateActivity);
    webview.addEventListener("page-title-updated", () => {
      const title = webview.getTitle();

      document.title = title;

      updateActivity();
    });
  };

  const setActivity = (activity) => {
    ipcRenderer.send("set-activity", {
      ...activity,
      startTimestamp: timestamp,
    });
  };

  const hideSplash = () => {
    ipcRenderer.send("hide-splash");
  };

  webview.addEventListener("did-finish-load", () => {
    const idleEvent = events.find((event) => event.name === "idling");
    oldEvent = idleEvent;

    listenPageChange();
    setActivity(idleEvent.createActivity());
    hideSplash();
  });
})();
