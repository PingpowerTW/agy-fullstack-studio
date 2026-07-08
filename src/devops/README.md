# DevOps & Infrastructure Standards

本目錄存放專案的部署配置、IaC (Terraform) 檔案、Dockerfile 以及 CI/CD 管道設定。

---

## 🔒 基礎設施安全門禁 (Infrastructure Security)

> [!IMPORTANT]
> - **嚴禁明文機密**：嚴禁將 `api_key`、資料庫密碼、TLS 證書私鑰寫死在 Dockerfile、docker-compose 或是 Kubernetes yaml 檔案中。
> - 所有機密變數必須使用環境變數加載，或者與雲端 KMS / HashiCorp Vault 串接。
> - **非 Root 執行**：Dockerfile 中必須指定非 root 用戶來運行容器：
>   ```dockerfile
>   USER node
>   ```

---

## 🧱 容器化與資源限額 (Resource Limits)
1. **CPU/Memory Constraints**：
   - 所有的生產容器配置 (Kubernetes Yaml 或 Compose) 必須設定 `limits` 與 `requests`，防範因 Memory Leak 導致整台主機被 OOM 殺掉：
     ```yaml
     resources:
       limits:
         memory: "512Mi"
         cpu: "1000m"
       requests:
         memory: "256Mi"
         cpu: "500m"
     ```
2. **多重構建 (Multi-stage Builds)**：
   - Dockerfile 必須採用 Multi-stage Builds 減少最終 Image 大小。
   - 生產階段必須排除 npm devDependencies 等開發相依套件。
