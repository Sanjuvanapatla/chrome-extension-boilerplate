import '@src/Popup.css';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';
import { t } from '@extension/i18n';
import { ToggleButton } from '@extension/ui';

const Popup = () => {
  const theme = useStorage(exampleThemeStorage);
  const isLight = theme === 'light';
  const logo = isLight ? 'popup/logo_vertical.svg' : 'popup/logo_vertical_dark.svg';

  const goGithubSite = () => {
    chrome.tabs.create({ url: 'https://github.com/Jonghakseo/chrome-extension-boilerplate-react-vite' });
  };

  const downloadAllImages = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    await chrome.scripting.executeScript({
      target: { tabId: tab.id! },
      func: () => {
        const imageUrls = Array.from(document.querySelectorAll('img')).map(img => img.src);
        imageUrls.forEach(url => {
          const link = document.createElement('a');
          link.href = url;
          link.download = url.split('/').pop() || 'image';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        });
      },
    });
  };

  const downloadAllTables = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    await chrome.scripting.executeScript({
      target: { tabId: tab.id! },
      func: () => {
        const tables = Array.from(document.querySelectorAll('table'));
        tables.forEach((table, index) => {
          let csv = '';
          Array.from(table.rows).forEach(row => {
            const cells = Array.from(row.cells).map(cell => `"${cell.textContent?.replace(/"/g, '""')}"`);
            csv += cells.join(',') + '\n';
          });

          const blob = new Blob([csv], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `table-${index + 1}.csv`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        });
      },
    });
  };

  return (
    <div className={`App ${isLight ? 'bg-slate-50' : 'bg-gray-800'}`}>
      <header className={`App-header ${isLight ? 'text-gray-900' : 'text-gray-100'}`}>
        <button onClick={goGithubSite}>
          <img src={chrome.runtime.getURL(logo)} className="App-logo" alt="logo" />
        </button>
        <p>Select an option:</p>

        <button
          className={`font-bold mt-4 py-1 px-4 rounded shadow hover:scale-105 ${
            isLight ? 'bg-blue-200 text-black' : 'bg-gray-700 text-white'
          }`}
          onClick={downloadAllImages}>
          Download All Images
        </button>

        <button
          className={`font-bold mt-4 py-1 px-4 rounded shadow hover:scale-105 ${
            isLight ? 'bg-blue-200 text-black' : 'bg-gray-700 text-white'
          }`}
          onClick={downloadAllTables}>
          Download All Tables
        </button>

        <ToggleButton>{t('toggleTheme')}</ToggleButton>
      </header>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Popup, <div>Loading...</div>), <div>Error Occurred</div>);
