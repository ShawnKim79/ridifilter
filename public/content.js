// 출판사 필터 리스트 (초기값)
let publisherFilters = [];

// 도서 카드의 출판사명을 추출하는 함수 (리디북스 DOM 구조에 맞게 수정 필요)
function getPublisherNameFromCard(cardElem) {
  // 예시: 출판사명이 .publisher 클래스에 있다고 가정
  const publisherElem = cardElem.querySelector('.publisher');
  return publisherElem ? publisherElem.textContent.trim() : '';
}

// 도서 카드 숨기기/보이기
function applyPublisherFilter() {
  // 도서 카드 DOM 선택자 (리디북스 실제 구조에 맞게 수정)
  const bookCards = document.querySelectorAll('.book-card');
  bookCards.forEach(card => {
    const publisher = getPublisherNameFromCard(card);
    const shouldHide = publisherFilters.some(filter =>
      publisher.includes(filter)
    );
    card.style.display = shouldHide ? 'none' : '';
  });
}

// storage 변경 감지 → 필터 리스트 갱신
if (chrome && chrome.storage && chrome.storage.sync) {
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "sync" && changes.publisherFilters) {
      publisherFilters = changes.publisherFilters.newValue || [];
      applyPublisherFilter();
    }
  });

  // 최초 실행 시 storage에서 필터 불러오기
  chrome.storage.sync.get(["publisherFilters"], (result) => {
    publisherFilters = result.publisherFilters || [];
    applyPublisherFilter();
  });
}

// DOM 변화 감시 (AJAX로 도서가 추가될 때도 필터 적용)
const observer = new MutationObserver(() => {
  applyPublisherFilter();
});

// 도서 목록 컨테이너 선택자 (리디북스 실제 구조에 맞게 수정)
function observeBookList() {
  const bookListContainer = document.querySelector('.book-list');
  if (bookListContainer) {
    observer.observe(bookListContainer, { childList: true, subtree: true });
    // 최초 1회 적용
    applyPublisherFilter();
  }
}

// 페이지 로드 후 도서 목록 컨테이너가 나타나면 감시 시작
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', observeBookList);
} else {
  observeBookList();
} 