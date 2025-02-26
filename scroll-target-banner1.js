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

  function debugPrint(txt) {
    if (IS_DEBUG && _debugEl) {
      console.log(txt);
      _debugEl.value += txt + " | ";
    }
  }

  function isMobileInstagram() {
    if (_options.forceIG) return true;
    return (
      /Mobi|Android|iPhone|iPad|iPod|BlackBerry|Opera Mini|IEMobile|WPDesktop/i.test(
        navigator.userAgent
      ) && navigator.userAgent.indexOf("Instagram") >= 0
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
    debugPrint("no time");
    return false;
  }

  if (isMobileInstagram()) {
    debugPrint("INSTAGRAM - OK");
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
    debugPrint("INSTAGRAM - NO");
    _isScrollRandom = true;
    timeControl(false);
    createBanner(true);
    scrollEventCheck();
  }

  function disableScroll() {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.addEventListener("touchmove", preventScroll, { passive: false });
    document.addEventListener("wheel", preventScroll, { passive: false });
  }

  function enableScroll() {
    document.body.style.overflow = "auto";
    document.documentElement.style.overflow = "auto";
    document.removeEventListener("touchmove", preventScroll);
    document.removeEventListener("wheel", preventScroll);
  }

  function preventScroll(event) {
    event.preventDefault();
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
  <a href="${link}" target="_blank" style="display: block; width: 100%; position: absolute;width: 100%;
    height: calc(100% - ${isCenter ? 0 : _blankAreaHeight}px); left: 0; bottom: 0; pointer-events: auto;" data-link></a>
  <span style="display: block; position: absolute; right: 0; top:0px; pointer-events: none; background-color: #fff;
    font-size: 0; border-radius: 100%; transform: translate(40%, -40%);">
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="16"
      height="16" viewBox="0 0 16 16">
      <path fill="#444444"
        d="M8 0c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zM12.2 10.8l-1.4 1.4-2.8-2.8-2.8 2.8-1.4-1.4 2.8-2.8-2.8-2.8 1.4-1.4 2.8 2.8 2.8-2.8 1.4 1.4-2.8 2.8 2.8 2.8z">
      </path>
    </svg>
  </span>
</div>`;

    var div = document.createElement("div");
    Object.assign(div.style, {
      position: "fixed",
      left: "50%",
      top: "50%",
      maxWidth: "280px",
      width: "100%",
      transform: "translate(-50%, -50%)",
      display: "none",
      zIndex: 999,
    });

    div.innerHTML = el;
    document.body.appendChild(div);
    _popBannerElement = div;
  }
};
