const { getCurrentWindow } = require("@electron/remote");

(() => {
  const mainWindow = getCurrentWindow();

  let isMaximized = true;

  const webview = document.querySelector("webview");

  const backNavigationButton = document.querySelector(".navigation-back");
  const forwardNavigationButton = document.querySelector(".navigation-forward");
  const reloadNavigationButton = document.querySelector(".navigation-reload");

  const minimizeActionButton = document.querySelector(".action-minimize");
  const maximizeActionButton = document.querySelector(".action-maximize");
  const closeActionButton = document.querySelector(".action-close");

  const headerTitle = document.querySelector(".title-bar-title");

  const handleNavigationClick = () => {
    backNavigationButton.addEventListener("click", () => {
      webview.goBack();
    });

    forwardNavigationButton.addEventListener("click", () => {
      webview.goForward();
    });

    reloadNavigationButton.addEventListener("click", () => {
      webview.reload();
    });
  };

  const handleNavigationRender = () => {
    const handleBackRender = () => {
      if (!webview.canGoBack()) {
        backNavigationButton.disabled = true;
      } else {
        backNavigationButton.disabled = false;
      }
    };

    const handleForwardRender = () => {
      if (!webview.canGoForward()) {
        forwardNavigationButton.disabled = true;
      } else {
        forwardNavigationButton.disabled = false;
      }
    };

    handleBackRender();
    handleForwardRender();
  };

  const handleNavigation = () => {
    handleNavigationRender();
    handleNavigationClick();
  };

  const handleAction = () => {
    minimizeActionButton.addEventListener("click", () => {
      mainWindow.minimize();
    });

    maximizeActionButton.addEventListener("click", () => {
      if (isMaximized) {
        mainWindow.unmaximize();

        isMaximized = false;
      } else {
        mainWindow.maximize();

        isMaximized = true;
      }
    });

    closeActionButton.addEventListener("click", () => {
      mainWindow.close();
    });
  };

  const handleWindowEvents = () => {
    mainWindow.on("maximize", () => {
      isMaximized = true;
    });

    mainWindow.on("unmaximize", () => {
      isMaximized = false;
    });
  };

  const handleTitle = () => {
    const title = webview.getTitle();

    mainWindow.setTitle(title);

    headerTitle.textContent = title;
  };

  webview.addEventListener("dom-ready", () => {
    webview.addEventListener("did-navigate-in-page", handleNavigationRender);
    webview.addEventListener("page-title-updated", handleTitle);

    handleNavigation();
    handleAction();
    handleWindowEvents();
    handleTitle();
  });
})();
