window.scrollTargetBanner = function (images, link, time, options) {
  var IS_DEBUG = false;
  var VISIT_TIME = "__BNR__CENTERFLOATING__";
  // 이미지 랜덤하게 1개 고르기
  var _selectedImage = images[Math.floor(Math.random() * images.length)];
  var _popBannerElement = null;
  var _targetElement = null;
  var _options = options;
  var _isScrollRandom = false;
  var _savedScrollY = 0;
  // 이미 방문했던 사용자 + 일정 시간 이후 다시 방문했을 떄 스크롤 양이 0~50% 사이의 랜덤값
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

    // 기존 스크롤 위치 복원
    window.scrollTo(0, _savedScrollY);
  }

  /**
   * 일반조건 -> 크롤양 랜덤하게 노출 (시간제한 없이 항상 노출)
   * 스크롤고정 => 쿠팡 다이나믹 배너와 겹치게 노출되고 스크롤 고정 적용
   *
   * 1. 페이스북 브라우저 사용자
   *  1) 처음 방문이거나 정해진 시간 이후 재방문 => 스크롤고정
   *  1) 정해진 시간 내 재방문 => 일반조건
   *
   * 2. 그밖에 브라우저 모바일/피씨 모두
   *  1) 일반조건
   */
  if (isMobileTHREADS()) {
    debugPrint("THREADS - OK");
    // 페이스북 브라우저
    if (isReturningWithinPeriod()) {
      // 이미 방문했던 사용자 + 일정 시간 내 다시 방문
      _isScrollRandom = true;
      createBanner(true);
      scrollEventCheck();
      debugPrint("일정시간 내 방문");
    } else {
      // 이미 방문했던 사용자 + 일정 시간 이 후 다시 방문
      timeControl(false);
      createBanner();
      scrollEventCheck();
      debugPrint("일정시간 이후 방문");
    }
  } else {
    debugPrint("THREADS - NO");
    // 그 외.. 무조건 랜덤하게 노출
    _isScrollRandom = true;
    timeControl(false);
    createBanner(true);
    scrollEventCheck();
  }
  debugPrint("_isScrollRandom: " + _isScrollRandom);
  debugPrint("_scrollLockPosition: " + _scrollLockPosition);
  function isMobileFaceBook() {
    if (_options.forceTH) return true;
    return (
      /Mobi|Android|iPhone|iPad|iPod|BlackBerry|Opera Mini|IEMobile|WPDesktop/i.test(
        navigator.userAgent
      ) && navigator.userAgent.indexOf("[TH") >= 0
    );
  }

  function timeControl(isSet) {
    if (isSet) {
      localStorage.setItem(VISIT_TIME, new Date().getTime());
    } else {
      localStorage.removeItem(VISIT_TIME);
    }
  }

  // 일정 시간내 다시 방문 체크
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
  
// 배너가 나타날 때 스크롤을 차단하는 함수
function disableScroll() {
  // body, html 태그의 overflow를 hidden으로 설정하여 스크롤을 차단
  document.body.style.overflow = "hidden";
  document.documentElement.style.overflow = "hidden";

  // 모바일에서 터치 스크롤 차단
  document.addEventListener("touchmove", preventScroll, { passive: false });
  document.addEventListener("wheel", preventScroll, { passive: false });
}

// 배너가 사라졌을 때 스크롤을 활성화하는 함수
function enableScroll() {
  // body, html 태그의 overflow를 auto로 복구하여 스크롤을 허용
  document.body.style.overflow = "auto";
  document.documentElement.style.overflow = "auto";

  // 모바일에서 터치 스크롤 차단 해제
  document.removeEventListener("touchmove", preventScroll);
  document.removeEventListener("wheel", preventScroll);
}

// touchmove 및 wheel 이벤트가 발생하면 스크롤을 막는 함수
function preventScroll(event) {
  event.preventDefault();
}


// 배너 닫기 버튼 클릭 시 스크롤 다시 가능하게 설정
document.querySelector("#closeBannerButton").addEventListener("click", function () {
  _popBannerElement.style.display = "none";  // 배너 숨기기
  enableScroll(); // 스크롤 허용
});

// 스크롤 핸들러
function onScrollHandler() {
  if (_scrollLockPosition !== -1) {
      // 스크롤 고정 포지션이 설정되면 무조건 고정
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

  // 스크롤이 8% 이상 내려갔을 때 배너 표시
  if ((curTop / totalHeight) * 100 >= 15) {
      console.log("✅ 스크롤 8% 도달, 배너 표시");
      _popBannerElement.style.display = "block";
      _popBannerElement.style.opacity = "1";
      _popBannerElement.style.visibility = "visible";
    
      // 배너가 보이면 스크롤 금지
      disableScroll();
  }

  if (rect.top <= _options.displayPositionTop) {
      if (_scrollLockPosition === -1) {
          _scrollLockPosition = rect.top + curTop;
      }
      _popBannerElement.style.display = "block";
      disableScroll(); // 배너가 보이면 스크롤 금지
  }
}


  function scrollEventCheck() {
    window.addEventListener("scroll", onScrollHandler);
//   window.addEventListener('touchmove', onScrollHandler);  // 모바일에서 터치 이동시에도 이벤트 발생
  }

  function removeScrollEvent() {
    window.removeEventListener("scroll", onScrollHandler);
//   window.addEventListener('touchmove', onScrollHandler);  // 모바일에서 터치 이동시에도 이벤트 발생
  }

  function applyLinkWithClose() {
    timeControl(true);
    removeScrollEvent();
    enableScroll();
    _scrollLockPosition = -1;
    _popBannerElement.remove();
  }

  // 배너를 숨긴채로 생성
  function createBanner(isCenter) {
    var el = `
<div id="closeBannerButton" style="display: block; position: relative; width: 100%;">
<img style="width: 100%; pointer-events: none;" src="${_selectedImage}" alt="배너 이미지" />
<a href="${link}" target="_blank" style="display: block; width: 100%; position: absolute;width: 100%;height: calc(100% - ${
      isCenter ? 0 : _blankAreaHeight
    }px);left: 0;bottom: 0; pointer-events: auto;" data-link></a>
<span style="display: block; position: absolute; right: 0;top:0px; pointer-events: none; background-color: #fff;font-size: 0; border-radius: 100%; transform: translate(40%, -40%);">
  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="16"
    height="16" viewBox="0 0 16 16">
    <path fill="#444444"
      d="M8 0c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zM12.2 10.8l-1.4 1.4-2.8-2.8-2.8 2.8-1.4-1.4 2.8-2.8-2.8-2.8 1.4-1.4 2.8 2.8 2.8-2.8 1.4 1.4-2.8 2.8 2.8 2.8z">
    </path>
  </svg>
</span>
<button type="buttonn" style="cursor:pointer; display: block;border: 0;background: ${
  _options.buttonStyles.background
};width: ${_options.buttonStyles.width}px;height: ${
      _options.buttonStyles.height
    }px; position: absolute;right: ${
      _options.buttonStyles.right
    }px; padding:0; margin: 0; top: ${
      _options.buttonStyles.top
    }px" data-close>
</button>
</div>
`;
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
        window.open(link); //window.location.href = link;
      });
    document.body.appendChild(div);
    _popBannerElement = div;
  }
};
