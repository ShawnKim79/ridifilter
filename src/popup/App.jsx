import React, { useEffect, useState } from 'react';

export default function App() {
  const [filters, setFilters] = useState([]);
  const [input, setInput] = useState("");

  // 필터 불러오기
  useEffect(() => {
    if (chrome && chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.get(["publisherFilters"], (result) => {
        setFilters(result.publisherFilters || []);
      });
    }
  }, []);

  // 모든 리디북스 탭에 필터 적용 메시지 전송 (에러 무시)
  const notifyTabs = () => {
    if (chrome && chrome.tabs && chrome.tabs.query && chrome.tabs.sendMessage) {
      chrome.tabs.query({ url: "*://ridibooks.com/*" }, (tabs) => {
        tabs.forEach(tab => {
          chrome.tabs.sendMessage(tab.id, { type: "APPLY_PUBLISHER_FILTER" }, () => {
            if (chrome.runtime.lastError) {
              // content script가 없는 탭에서는 에러 무시
              // console.warn('No content script in this tab:', chrome.runtime.lastError.message);
            }
          });
        });
      });
    }
  };

  // 필터 추가
  const addFilter = () => {
    const value = input.trim();
    if (!value || filters.includes(value)) return;
    const newFilters = [...filters, value];
    setFilters(newFilters);
    if (chrome && chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.set({ publisherFilters: newFilters }, () => {
        notifyTabs();
      });
    }
    setInput("");
  };

  // 필터 삭제
  const removeFilter = (filter) => {
    const newFilters = filters.filter(f => f !== filter);
    setFilters(newFilters);
    if (chrome && chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.set({ publisherFilters: newFilters }, () => {
        notifyTabs();
      });
    }
  };

  // storage 변경 감지 (다른 탭에서 변경 시 동기화)
  useEffect(() => {
    if (chrome && chrome.storage && chrome.storage.onChanged) {
      const listener = (changes, area) => {
        if (area === "sync" && changes.publisherFilters) {
          setFilters(changes.publisherFilters.newValue || []);
        }
      };
      chrome.storage.onChanged.addListener(listener);
      return () => chrome.storage.onChanged.removeListener(listener);
    }
  }, []);

  return (
    <div style={{ padding: 16, minWidth: 250 }}>
      <h3>출판사 필터</h3>
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="출판사명 입력"
        onKeyDown={e => e.key === "Enter" && addFilter()}
        style={{ width: '70%' }}
      />
      <button onClick={addFilter} style={{ marginLeft: 8 }}>추가</button>
      <div style={{ marginTop: 12 }}>
        {filters.map(filter => (
          <span key={filter} style={{
            display: "inline-block", background: "#eee", margin: 2, padding: "2px 8px", borderRadius: 8
          }}>
            {filter}
            <button onClick={() => removeFilter(filter)} style={{ marginLeft: 4, border: 'none', background: 'transparent', cursor: 'pointer' }}>x</button>
          </span>
        ))}
      </div>
    </div>
  );
} 