# 回声 Echo

AI 辅助的用户反馈分析与改进工作台。整理原始反馈、核对分析依据、保存人工判断，并跟踪后续行动。

[在线体验](https://xxx123ing.github.io/echo-feedback-workbench/) · [问题反馈](https://github.com/xxx123ing/echo-feedback-workbench/issues)

## 功能

- 项目管理：支持 App 体验、活动反馈和内容复盘。
- 反馈处理：录入、分类、合并并保留原始材料。
- AI 分析：提取原文依据、信息缺口与待验证假设。
- 人工审核：编辑判断卡，查看分析历史和版本差异。
- 改进跟踪：将下一步行动加入待办，记录后续处理。
- 数据保存：演示模式支持浏览器本地保存及 JSON 导出。

## 快速开始

需要 Node.js 22.12 或更高版本。

```sh
git clone https://github.com/xxx123ing/echo-feedback-workbench.git
cd echo-feedback-workbench
npm ci
npm run build:demo
npm run preview
```

打开终端显示的本地地址。演示模式使用示例反馈和历史 AI 分析结果，无需 API 密钥，不会实时调用模型。已保存的数据保留在当前浏览器，清除网站数据会删除记录；可通过“导出项目记录”备份。

## 配置 AI 分析

将 `.env.example` 复制为 `.env.local`，填写自己的 `DEEPSEEK_API_KEY` 和模型名称。不要提交密钥文件。

在两个终端分别运行：

```sh
npm run server
```

```sh
npm run dev
```

本地 API 模式会将待分析内容发送至配置的模型服务，并产生相应用量。服务默认只监听本机。

## 开发与测试

```sh
npm test
npm run build:demo
```

主要目录：

| 目录 | 内容 |
| --- | --- |
| `src/` | React 界面、项目流程与演示数据 |
| `server/` | 本地 API、存储与 AI 分析校验 |
| `tests/` | 流程、持久化与输出校验测试 |
| `docs/` | 使用说明、评测记录与发布说明 |

## 使用说明

1. 选择项目并录入反馈。
2. 查看原始材料及分析结果。
3. 编辑“是什么、为什么这样判断、下一步怎么做”并保存。
4. 建立改进事项，记录后续处理情况。
5. 按需导出项目记录。

AI 分析需要人工核对。引用匹配不代表语义判断正确。当前不支持多用户权限或跨设备同步。

## 部署

仓库提供 GitHub Pages 工作流。在仓库 **Settings → Pages** 中选择 **GitHub Actions**，推送至 `main` 后运行测试、构建与部署。Pages 仅提供静态演示，不承载 Node.js 后端。

## 文档

- [使用指南](docs/DEMO_GUIDE.md)
- [设计说明](DESIGN.md)
- [版本评测](docs/comparison-v2-v3.md)
- [结构化输出验证](docs/report-v4.md)
- [发布记录](docs/RELEASE.md)

评测使用构造案例及 AI 辅助审阅；测试结果不等同于真实场景准确率。

## 参与贡献

欢迎通过 Issues 报告问题或提出建议，通过 Pull Request 提交修改。报告问题时请提供复现步骤、运行环境及预期结果，避免上传密钥或私人反馈。

## 许可证与第三方说明

项目采用 [MIT License](LICENSE)，依赖遵循各自许可证。开发使用 Codex 辅助。早期问卷集成使用独立运行的 Formbricks，当前保留数据映射代码，不包含其源码。详见 [第三方说明](THIRD_PARTY_NOTICES.md)。
