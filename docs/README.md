# 工程文档

- [产品与路线图](product.md)
- [架构](architecture.md)
- [开发与质量](development.md)
- [内容发布](content.md)
- [认证与数据](data.md)
- [部署与恢复](deployment.md)
- [架构决策](adr/0001-platform.md)
- [生成的技术清单](generated.md)
- [免费演示版首发验收](releases/2026-09-20.md)

代码是可推导信息的来源。执行 `bun run docs:generate` 更新技术清单，执行 `bun run docs:check` 验证。手写文档随代码更新；CI 不自动改写或提交文档。
