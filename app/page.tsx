import { chatGPTSignInPath, getChatGPTUser } from "./chatgpt-auth";
import ApartmentApp from "./apartment-app";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getChatGPTUser();
  if (!user) {
    return (
      <main className="signin-page">
        <section className="signin-card">
          <div className="signin-mark">A</div>
          <p className="eyebrow">apartmanOS</p>
          <h1>Yönetim, herkes için daha anlaşılır.</h1>
          <p>Aidatları, giderleri, duyuruları ve kararları apartmanınıza özel güvenli bir alanda yönetin.</p>
          <a className="primary-link" href={chatGPTSignInPath("/")} target="_top">ChatGPT ile giriş yap</a>
          <small>Giriş yaptığınızda yalnızca üyesi olduğunuz apartmanın verilerine erişirsiniz.</small>
        </section>
      </main>
    );
  }
  return <ApartmentApp user={{ displayName: user.displayName, email: user.email }} />;
}
