import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "服务条款",
  description: "微坞 WeWoo 用户服务条款，包括用户内容、知识产权、免责声明等。",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-page">
      <div className="max-w-3xl mx-auto px-4 py-12 pb-24">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">服务条款</h1>
        <p className="text-sm text-gray-500 mb-8">最后更新：2026年7月23日</p>

        <div className="prose prose-sm max-w-none space-y-6 text-gray-700">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">一、服务说明</h2>
            <p>
              微坞 WeWoo（以下简称"本平台"）是一个在线小工具分享社区，允许用户创建、发布和分享基于 HTML/CSS/JavaScript 的小型工具应用。使用本平台的服务即表示您同意本服务条款。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">二、用户注册与账户</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>用户需使用真实邮箱注册账户。</li>
              <li>用户应妥善保管账户密码，因账户泄露导致的损失由用户自行承担。</li>
              <li>禁止注册多个账户进行恶意行为。</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">三、用户内容</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>用户在本平台发布的工具代码及内容，知识产权归用户所有。</li>
              <li>用户授予本平台在平台上展示、运行和推广其工具的非独占许可。</li>
              <li>用户不得发布包含以下内容的工具：
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>违反法律法规的内容</li>
                  <li>恶意代码、病毒或挖矿脚本</li>
                  <li>侵犯他人知识产权的内容</li>
                  <li>收集他人隐私信息的行为</li>
                  <li>欺诈、色情或暴力内容</li>
                </ul>
              </li>
              <li>本平台有权对违规内容进行下架处理，并保留追究责任的权利。</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">四、知识产权</h2>
            <p>
              本平台的整体设计、品牌标识、源代码结构等知识产权归本平台所有。用户发布的工具内容归各自创作者所有。未经授权，不得复制或转载本平台的内容用于商业用途。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">五、免责声明</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>本平台不对用户工具的功能、安全性、准确性做任何担保。</li>
              <li>用户工具在沙箱环境中运行，本平台已采取安全隔离措施，但不对可能的安全风险承担全部责任。</li>
              <li>因不可抗力导致的服务中断，本平台不承担责任。</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">六、数据收集</h2>
            <p>
              本平台收集用户注册邮箱、工具使用数据（浏览量、收藏数）等信息。详情请参阅<a href="/privacy" className="text-indigo-600 hover:underline">隐私政策</a>。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">七、条款修改</h2>
            <p>
              本平台保留随时修改服务条款的权利。修改后的条款自发布之日起生效，继续使用本平台即视为接受修改后的条款。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">八、联系方式</h2>
            <p>如有任何问题，请通过本平台反馈渠道联系我们。</p>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-200">
          <a href="/" className="text-indigo-600 hover:underline text-sm">&larr; 返回首页</a>
        </div>
      </div>
    </div>
  );
}
