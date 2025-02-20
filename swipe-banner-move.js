const coverImageMoves = document.querySelectorAll('.cover-image-move');
const bannerLinks = document.querySelectorAll('.banner-image'); // 여러 개의 배너 링크 선택
let animationIntervals = new Map(); // 개별 애니메이션 관리

// 🚀 각 배너별로 즉시 애니메이션 실행 + 루프 시작
coverImageMoves.forEach((coverImageMove, index) => {
  startAnimationImmediately(coverImageMove, index);

  // 스와이프 변수
  let isTouching = false;
  let startX, startY;
  let lastX = 0, lastY = 0;
  let animationFrame;
  let swipeInProgress = false;

  // 즉시 애니메이션 실행 + 루프 시작
  function startAnimationImmediately(coverImageMove, index) {
    if (animationIntervals.has(index)) clearInterval(animationIntervals.get(index));

    coverImageMove.style.transition = 'transform 1.5s ease-in-out, opacity 0.5s ease-in-out';
    coverImageMove.style.transform = 'translateY(150px)'; // 바로 아래로 이동
    coverImageMove.style.opacity = '1'; // 다시 보이게 설정

    let movingDown = false; // 다음에 위로 가도록 설정

    // 2초마다 반복 실행
    const interval = setInterval(() => {
      if (!swipeInProgress) {
        coverImageMove.style.transition = 'transform 1.5s ease-in-out';

        if (movingDown) {
          coverImageMove.style.transform = 'translateY(150px)'; // 아래로 이동
        } else {
          coverImageMove.style.transform = 'translateY(-150px)'; // 위로 이동
        }

        movingDown = !movingDown; // 방향 변경
      }
    }, 2000);

    animationIntervals.set(index, interval);
  }

  // 스와이프 시작
  const startEvent = (e) => {
    isTouching = true;
    swipeInProgress = true;

    const touch = e.touches ? e.touches[0] : e;
    startX = touch.clientX - lastX;
    startY = touch.clientY - lastY;

    coverImageMove.style.transition = 'none';
    coverImageMove.style.cursor = 'grabbing';

    clearInterval(animationIntervals.get(index)); // 애니메이션 멈추기
    e.preventDefault();
  };

  // 스와이프 이동
  const moveEvent = (e) => {
    if (!isTouching) return;

    const touch = e.touches ? e.touches[0] : e;
    lastX = touch.clientX - startX;
    lastY = touch.clientY - startY;

    if (!animationFrame) {
      animationFrame = requestAnimationFrame(() => {
        coverImageMove.style.transform = `translate(${lastX}px, ${lastY}px)`;
        animationFrame = null;
      });
    }
  };

  // 스와이프 종료 후 숨기기 + 링크 이동 + 요소 삭제
  const endEvent = () => {
    if (isTouching) {
      isTouching = false;
      coverImageMove.style.cursor = 'grab';

      coverImageMove.style.transition = 'opacity 0.5s ease-out';
      coverImageMove.style.opacity = '0'; // 서서히 사라지게 함

      swipeInProgress = true; // 다시 애니메이션 시작 X (숨긴 후 멈춤)

      // 배너 이미지 클릭처럼 링크를 트리거 (새 탭에서 열기)
      if (bannerLinks[index]) {
        window.open(bannerLinks[index].href, '_blank'); // 새 탭에서 링크 열기
      }

      // coverImageMove 요소를 DOM에서 삭제
      setTimeout(() => {
        coverImageMove.remove();
      }, 500);
    }
  };

  // 배너 클릭 시 스와이프 배너 숨기기
  if (bannerLinks[index]) {
    bannerLinks[index].addEventListener('click', () => {
      coverImageMove.remove();
    });
  }

  // 이벤트 리스너 추가
  coverImageMove.addEventListener('touchstart', startEvent, { passive: false });
  coverImageMove.addEventListener('mousedown', startEvent);

  document.addEventListener('touchmove', moveEvent, { passive: false });
  document.addEventListener('mousemove', moveEvent);

  document.addEventListener('touchend', endEvent);
  document.addEventListener('mouseup', endEvent);
  document.addEventListener('touchcancel', endEvent);
});
