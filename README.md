# Ridifilter

리디북스 웹사이트에서 특정 출판사 또는 도서명을 필터링해 목록에서 숨길 수 있도록 지원하는 크롬 확장 프로그램입니다.

## 주요 기능
- 출판사/도서명 필터링
- 실시간 필터 적용
- 필터 임포트/익스포트
- 다크모드, 다국어 지원

## 설치 및 개발
```bash
npm install
npm run dev
```

## 크롬 확장 개발/테스트
1. `npm run build`로 번들링
2. `dist` 폴더를 크롬 확장 프로그램 관리에서 '압축해제된 확장 프로그램'으로 로드

## 배포
- GitHub Actions를 통한 자동 배포(예정)

## 기술 스택
- React + Vite
- Manifest V3
- Chrome Extension APIs

## 참고
- [Chrome 확장 프로그램 개발자 가이드](https://developer.chrome.com/docs/extensions/mv3/)
# ridifilter
