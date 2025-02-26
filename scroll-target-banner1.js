window.scrollTargetBanner = function (images, link, time, options) {
  var IS_DEBUG = false;
  var VISIT_TIME = "__BNR__CENTERFLOATING__";

  var _selectedImage = images[Math.floor(Math.random() * images.length)];
  var _popBannerElement = null;
  var _targetElement = null;
  var _options = options;
  var _isScrollRandom = false;
  var _savedScrollY = 0;

  var _scrollRandomValueStart = _options.scRange || [10, 50];
  var _randomValue =
    Math.floor(
      Math.random() *
        (_scrollRandomValueStart[0] - _scrollRandomValueStart[1] + 1)
    ) + _scrollRandomValueStart[1];

  var _scrollLockPosition = -1;
  var _debugEl = null;
  var _blankAreaHeight = _options.blankAreaHeight || 40;

  window.focus();
  window.addEventListener("blur", () => {
    setTimeout(() => {
      if (document.activeElement.tagName === "IFRAME") {
        applyLinkWithClose();
      }
    }, 1000);
  });

  if (IS_DEBUG) {
    _debugEl = document.createElement("textarea");
    Object.assign(_debugEl.style, {
      position: "fixed",
      display: "block",
      width: "100%",
      height: "150px",
      left: "0px",
      bottom: "0px",
      color: "#000",
      backgroundColor: "#fff",
      overflow: "auto",
      zIndex: 99999,
      border: "1px solid",
      whiteSpace: "pre-wrap",
    });

    document.body.appendChild(_debugEl);
  }

  function debugPrint(txt) {
    if (_debugEl) {
      console.log(txt);
      _debugEl.value += txt + " | ";
    }
  }

  function disableScroll() {
    _savedScrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${_scrollLockPosition}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.overflow = "hidden";
    document.body.style.width = "100%";
  }

  function enableScroll() {
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.overflow = "";
    document.body.style.width = "";
    window.scrollTo(0, _savedScrollY);
  }

  function isMobileThreadsOrFacebook() {
    if (_options.forceFB || _options.forceThreads) return true;
    return (
      /Mobi|Android|iPhone|iPad|iPod|BlackBerry|Opera Mini|IEMobile|WPDesktop/i.test(
        navigator.userAgent
      ) &&
      (navigator.userAgent.includes("[FB") || 
       navigator.userAgent.includes("Instagram") || 
       navigator.userAgent.includes("Threads"))
    );
  }

  function timeControl(isSet) {
    if (isSet) {
      localStorage.setItem(VISIT_TIME, new Date().getTime());
    } else {
      localStorage.removeItem(VISIT_TIME);
    }
  }

  function isReturningWithinPeriod() {
    var lastVisit = localStorage.getItem(VISIT_TIME);
    var now = new Date().getTime();
    var timeLimit = 60 * time * 1e3;
    if (lastVisit) {
      var lastVisitTime = parseInt(lastVisit, 10);
      debugPrint(now - lastVisitTime + " / " + timeLimit);
      if (now - lastVisitTime < timeLimit) {
        return true;
      }
    }
    return false;
  }

  if (isMobileThreadsOrFacebook()) {
    debugPrint("Threads 또는 Facebook - OK");
    if (isReturningWithinPeriod()) {
      _isScrollRandom = true;
      createBanner(true);
      scrollEventCheck();
      debugPrint("일정시간 내 방문");
    } else {
      timeControl(false);
      createBanner();
      scrollEventCheck();
      debugPrint("일정시간 이후 방문");
    }
  } else {
    debugPrint("Threads 또는 Facebook - NO");
    _isScrollRandom = true;
    timeControl(false);
    createBanner(true);
    scrollEventCheck();
  }

  function onScrollHandler() {
    if (_scrollLockPosition !== -1) {
      window.scrollTo(0, _scrollLockPosition);
      return;
    }

    if (!_targetElement) {
      _targetElement = document.querySelector(_options.target);
    }

    if (!_targetElement) {
      console.error("Target element not found");
      return;
    }

    var rect = _targetElement.getBoundingClientRect();
    var totalHeight = document.body.scrollHeight - window.innerHeight;
    var curTop = window.scrollY;
    _savedScrollY = curTop;

    if ((curTop / totalHeight) * 100 >= 15) {
      _popBannerElement.style.display = "block";
      _popBannerElement.style.opacity = "1";
      _popBannerElement.style.visibility = "visible";
      disableScroll();
    }

    if (rect.top <= _options.displayPositionTop) {
      if (_scrollLockPosition === -1) {
        _scrollLockPosition = rect.top + curTop;
      }
      _popBannerElement.style.display = "block";
      disableScroll();
    }
  }

  function scrollEventCheck() {
    window.addEventListener("scroll", onScrollHandler);
  }

  function removeScrollEvent() {
    window.removeEventListener("scroll", onScrollHandler);
  }

  function applyLinkWithClose() {
    timeControl(true);
    removeScrollEvent();
    enableScroll();
    _scrollLockPosition = -1;
    _popBannerElement.remove();
  }

  function createBanner(isCenter) {
    var el = `
    <div id="closeBannerButton" style="display: block; position: relative; width: 100%;">
      <img style="width: 100%; pointer-events: none;" src="${_selectedImage}" alt="배너 이미지" />
      <a href="${link}" target="_blank" style="display: block; width: 100%; position: absolute;width: 100%;height: calc(100% - ${isCenter ? 0 : _blankAreaHeight}px);left: 0;bottom: 0; pointer-events: auto;" data-link></a>
    </div>`;
    
    var div = document.createElement("div");
    if (isCenter) {
      Object.assign(div.style, {
        position: "fixed",
        left: "50%",
        top: "50%",
        maxWidth: "280px",
        width: "100%",
        transform: "translate(-50%, -50%)",
        display: "none",
        "z-index": 999,
      });
    } else {
      Object.assign(div.style, {
        position: "fixed",
        left: "50%",
        maxWidth: "280px",
        width: "100%",
        transform: "translateX(-50%)",
        top: _options.bannerTop + "px",
        display: "none",
        pointerEvents: "none",
        "z-index": 999,
      });
    }

    div.innerHTML = el;
    var closeButton = div.querySelector("[data-close]");
    var bannerButton = div.querySelector("[data-link]");
    closeButton &&
      closeButton.addEventListener("click", function (e) {
        e.preventDefault();
        applyLinkWithClose();
      });
    bannerButton &&
      bannerButton.addEventListener("click", function (e) {
        e.preventDefault();
        applyLinkWithClose();
        window.open(link);
      });
    document.body.appendChild(div);
    _popBannerElement = div;
  }
};
