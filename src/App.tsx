import { OfficialTreeSolution } from './pages/OfficialTreeSolution';

export function App() {
  return (
    <div className="app">
      <header className="app-header">
        <div className="header-top">
          <div className="header-titles">
            <h1>任务管理与嵌套树形拖拽系统</h1>
            <p className="app-subtitle">基于 @dnd-kit 官方 Tree All Features 架构 · 2层深度约束与投影计算</p>
          </div>
        </div>
      </header>

      <main className="app-main">
        <OfficialTreeSolution />
      </main>
    </div>
  );
}

export default App;
