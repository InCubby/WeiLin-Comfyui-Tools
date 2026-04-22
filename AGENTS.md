# Repository Guidelines（仓库贡献指南）

## 项目结构与模块组织
- `__init__.py`：ComfyUI 插件入口，负责注册前端资源并加载后端路由。
- `app/server/`：Python 后端核心逻辑（API、翻译、LoRA/Tag 管理、历史记录、数据访问层）。
- `js_node/`：与 ComfyUI 节点交互的前端脚本。
- `src/src/`：Vue 3 前端源码（`view/`、`components/`、`api/`、`stores/`、`styles/`）。
- `dist/`：前端构建产物，运行时由插件加载，通常视为生成文件。
- `user_data/`、`lora_userdatas/`、`random_tag/`、`translate_userdatas/`：用户运行数据目录，请勿提交个人或临时数据。

## 构建、测试与开发命令
- 安装后端依赖：`python -m pip install -r requirements.txt`
- 在 `src/src` 目录执行前端命令：
- `yarn install`：安装依赖
- `yarn dev`：启动 Vite 本地开发服务
- `yarn build`：构建并输出到仓库根目录 `dist/`
- `yarn preview`：预览构建结果
- `yarn quality`：执行 ESLint + Stylelint + Prettier 检查
- `yarn quality:fix`：自动修复可修复的格式与样式问题
- Python 代码质量检查（本地已安装时）：`ruff check .`、`black .`

## 代码风格与命名规范
- Python 遵循 `pyproject.toml`：Black/Ruff，行宽 `88`，目标版本 `py310`。
- 前端遵循 `src/src` 下 ESLint、Stylelint、Prettier 配置。
- Prettier 关键规则：2 空格缩进、单引号、无分号、最大行宽 100。
- 命名建议：
- Python 模块与函数使用 `snake_case`。
- 通用 Vue 组件文件使用 `PascalCase`（如 `DraggableWindow.vue`）。
- 页面/功能文件可使用 `snake_case`（如 `lora_index.vue`）。

## 测试要求
- 当前仓库暂无独立自动化测试框架。
- 提交 PR 前至少完成两项检查：
- 在 `src/src` 运行 `yarn quality`。
- 在 ComfyUI 中做手工冒烟测试（窗口能打开、关键接口可用、前后端无明显报错）。
- 修复缺陷时，请在 PR 描述中写清复现步骤和验证结果。

## 提交与合并请求规范
- 提交信息建议简洁明确，尽量沿用现有风格：`feat:`、`fix:`、`docs:`、`refactor:`。
- 一次提交只做一类改动，避免把重构与功能变更混在同一提交中。
- PR 建议包含：变更内容与原因、关联 Issue/PR（如有）、UI 变更截图/录屏、已完成检查项说明。

## 安全与配置提示
- 禁止提交密钥或敏感配置（例如 `init.json` 中的 API Key）。
- 镜像源与包管理器个性化配置应优先保留在本地，避免无必要修改团队默认配置。
