import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "隐私政策",
  description: "微坞 WeWoo 隐私政策，说明我们如何收集、使用和保护您的个人信息。",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-page">
      <div className="max-w-3xl mx-auto px-4 py-12 pb-24">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">隐私政策</h1>
        <p className="text-sm text-gray-500 mb-8">最后更新：2026年7月23日</p>

        <div className="prose prose-sm max-w-none space-y-6 text-gray-700">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">一、信息收集</h2>
            <p>我们收集以下信息：</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong>账户信息：</strong>注册邮箱地址（用于登录和账户验证）。</li>
              <li><strong>工具内容：</strong>用户创建的工具代码、标题、描述和分类。</li>
              <li><strong>使用数据：</strong>工具浏览次数、收藏记录、评价内容。</li>
              <li><strong>技术数据：</strong>浏览器类型、设备信息（用于优化体验）。</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">二、信息使用</h2>
            <p>我们使用收集的信息用于：</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>提供用户认证和工具管理功能</li>
              <li>展示工具热度排行和推荐</li>
              <li>改进平台性能和用户体验</li>
              <li>防止滥用和恶意行为</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">三、数据存储</h2>
            <p>
              用户数据存储于 Supabase 云数据库（位于首尔区域）。所有数据传输使用 HTTPS 加密。密码使用 bcrypt 算法哈希存储，不以明文形式保存。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">四、数据安全</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>数据库启用行级安全（RLS）策略，用户只能修改自己的数据。</li>
              <li>用户工具代码在沙箱 iframe 中运行，与主站点隔离。</li>
              <li>工具发布前进行安全代码扫描，检测恶意 API 调用。</li>
              <li>图片上传至受控的 Storage 存储桶，仅允许已登录用户写入。</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">五、第三方服务</h2>
            <p>本平台使用以下第三方服务：</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong>Supabase：</strong>提供用户认证、数据库和文件存储服务。</li>
              <li><strong>Vercel：</strong>提供网站托管和 CDN 分发服务。</li>
              <li><strong>Cloudflare：</strong>提供域名解析服务。</li>
            </ul>
            <p className="mt-2">这些服务可能有各自的隐私政策，我们建议您阅读相关条款。</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">六、Cookie 使用</h2>
            <p>
              本平台使用必要的 Cookie 来维持用户登录状态。不使用第三方广告追踪 Cookie。浏览器中存储的工具草稿和收藏信息使用 localStorage。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">七、用户权利</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>您有权访问、修改和删除自己的账户数据。</li>
              <li>您有权删除自己发布的工具。</li>
              <li>您有权导出自己的工具数据。</li>
              <li>如需行使上述权利，请联系平台。</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">八、未成年人保护</h2>
            <p>
              本平台不面向 13 岁以下未成年人。如发现未成年用户，我们将采取措施保护其隐私。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">九、政策更新</h2>
            <p>
              我们可能不时更新本隐私政策。更新后的政策自发布之日起生效。继续使用本平台即视为接受更新后的政策。
            </p>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-200">
          <a href="/" className="text-indigo-600 hover:underline text-sm">&larr; 返回首页</a>
        </div>
      </div>
    </div>
  );
}
