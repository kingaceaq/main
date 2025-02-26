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
      ) && navigator.userAgent.includes("Instagram")
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
    _savedScrollY = window.scrollY;
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
    window.scrollTo(0, _savedScrollY);
  }

  function preventScroll(event) {
    event.preventDefault();
  }
};
