import { useState, useEffect } from 'react';
import { Loader2, ExternalLink, RefreshCw, MessageCircle, Eye, Heart, Newspaper } from 'lucide-react';

interface TelegramPost {
  id: string;
  html: string;
  text: string;
  date: string;
  views: string;
  link: string;
  images: string[];
}

const CHANNEL = 'Sweetsosquahub';
const CHANNEL_URL = `https://t.me/s/${CHANNEL}`;

// Парсим HTML страницу канала
function parsePosts(html: string): TelegramPost[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const postElements = doc.querySelectorAll('.tgme_widget_message_wrap');
  const posts: TelegramPost[] = [];

  postElements.forEach(el => {
    try {
      const messageEl = el.querySelector('.tgme_widget_message');
      if (!messageEl) return;

      const id = messageEl.getAttribute('data-post') || '';
      const textEl = el.querySelector('.tgme_widget_message_text');
      const dateEl = el.querySelector('.tgme_widget_message_date time');
      const viewsEl = el.querySelector('.tgme_widget_message_views');

      // Собираем изображения
      const images: string[] = [];
      el.querySelectorAll('.tgme_widget_message_photo_wrap').forEach(photo => {
        const style = photo.getAttribute('style') || '';
        const match = style.match(/url\(['"](.*?)['"]\)/);
        if (match) images.push(match[1]);
      });

      // Также проверяем <img> внутри поста
      el.querySelectorAll('.tgme_widget_message_photo img, .tgme_widget_message_document_thumb img').forEach(img => {
        const src = img.getAttribute('src');
        if (src) images.push(src);
      });

      const html = textEl?.innerHTML || '';
      const text = textEl?.textContent || '';
      const date = dateEl?.getAttribute('datetime') || '';
      const views = viewsEl?.textContent?.trim() || '';

      if (text.trim().length > 10) {
        posts.push({
          id,
          html,
          text: text.trim(),
          date,
          views,
          link: `https://t.me/${id}`,
          images,
        });
      }
    } catch {}
  });

  return posts.reverse(); // новые сверху
}

// Форматирование даты
function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch { return dateStr; }
}

// Очищаем HTML от тегов для превью, оставляем текст
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

// Убираем ссылки из HTML — оставляем текст ссылки, но без <a> тега
// Также убираем ссылки вида https://... и t.me/... из текста
function cleanPostHtml(html: string): string {
  // Заменяем <a href="...">текст</a> на просто текст
  let cleaned = html.replace(/<a[^>]*>(.*?)<\/a>/gi, '$1');
  // Убираем голые URL из текста
  cleaned = cleaned.replace(/https?:\/\/[^\s<]+/gi, '');
  // Убираем t.me ссылки
  cleaned = cleaned.replace(/t\.me\/[^\s<]+/gi, '');
  // Убираем пустые строки которые остались
  cleaned = cleaned.replace(/(<br\s*\/?>\s*){3,}/gi, '<br/><br/>');
  return cleaned;
}

export function NewsPage() {
  const [posts, setPosts] = useState<TelegramPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);

  const loadPosts = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(CHANNEL_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();
      const parsed = parsePosts(html);
      setPosts(parsed);
    } catch (e) {
      console.error('Failed to load Telegram posts:', e);
      setError(true);
    }
    setLoading(false);
  };

  useEffect(() => { loadPosts(); }, []);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1520] via-[#0d1117] to-[#0a0e13]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.5\'/%3E%3C/svg%3E")' }} />
        <div className="relative z-10 max-w-4xl mx-auto px-4 pt-10 pb-6">
          <div className="flex items-center gap-3 mb-3">
            <Newspaper className="w-7 h-7 text-[#2AABEE]" />
            <h1 className="font-display text-5xl sm:text-6xl font-black text-white tracking-tight">НОВОСТИ</h1>
          </div>
          <p className="font-body text-slate-400 text-base sm:text-lg">
            Посты из Telegram-канала <a href="https://t.me/Sweetsosquahub" target="_blank" rel="noopener" className="text-[#2AABEE] hover:underline">@СВИТ</a> · Мета, сборки, гайды
          </p>
          <div className="flex items-center gap-2 mt-3">
            <div className="w-2.5 h-2.5 rounded-full bg-[#2AABEE] animate-pulse" />
            <span className="text-sm font-body text-slate-500">83K подписчиков · Обновляется в реальном времени</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-16">
        {/* Refresh */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-sm font-body text-slate-500">{posts.length > 0 ? `${posts.length} постов` : ''}</span>
          <button onClick={loadPosts} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all text-sm font-body" disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Обновить
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-24 gap-3">
            <Loader2 className="w-7 h-7 text-[#2AABEE] animate-spin" />
            <span className="text-lg font-body text-slate-400">Загрузка постов из Telegram...</span>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-8 text-center">
            <p className="text-lg font-body text-red-400 mb-3">Не удалось загрузить посты</p>
            <p className="text-sm font-body text-slate-500 mb-4">Возможно, Telegram Preview заблокирован в вашей сети</p>
            <div className="flex items-center justify-center gap-3">
              <button onClick={loadPosts} className="px-5 py-2.5 rounded-lg bg-red-500/20 text-red-400 font-body font-bold hover:bg-red-500/30 transition-colors">
                Попробовать снова
              </button>
              <a href="https://t.me/Sweetsosquahub" target="_blank" rel="noopener"
                className="px-5 py-2.5 rounded-lg bg-[#2AABEE]/20 text-[#2AABEE] font-body font-bold hover:bg-[#2AABEE]/30 transition-colors flex items-center gap-2">
                <ExternalLink className="w-4 h-4" /> Открыть в Telegram
              </a>
            </div>
          </div>
        )}

        {/* Posts */}
        {!loading && !error && (
          <div className="space-y-4">
            {posts.map(post => {
              const isExpanded = expandedPost === post.id;
              const preview = stripHtml(post.html);
              const isLong = preview.length > 300;

              return (
                <article key={post.id}
                  className="rounded-2xl bg-gradient-to-br from-[#111827] to-[#0d1117] border border-white/5 overflow-hidden hover:border-white/10 transition-all duration-300">
                  
                  {/* Image */}
                  {post.images.length > 0 && (
                    <div className="relative aspect-[2/1] overflow-hidden">
                      <img src={post.images[0]} alt="" className="w-full h-full object-cover" loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent" />
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-5 sm:p-6">
                    {/* Text */}
                    <div className={`font-body text-base text-slate-300 leading-relaxed ${!isExpanded && isLong ? 'line-clamp-4' : ''}`}
                      style={!isExpanded && isLong ? {
                        display: '-webkit-box',
                        WebkitLineClamp: 4,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      } : undefined}
                      dangerouslySetInnerHTML={{ __html: cleanPostHtml(post.html) }}
                    />

                    {isLong && (
                      <button onClick={() => setExpandedPost(isExpanded ? null : post.id)}
                        className="text-sm font-body text-[#2AABEE] hover:underline mt-2">
                        {isExpanded ? 'Свернуть' : 'Читать полностью →'}
                      </button>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                      <div className="flex items-center gap-4">
                        {post.date && (
                          <span className="text-xs font-body text-slate-500">{formatDate(post.date)}</span>
                        )}
                        {post.views && (
                          <div className="flex items-center gap-1 text-xs font-body text-slate-500">
                            <Eye className="w-3.5 h-3.5" /> {post.views}
                          </div>
                        )}
                      </div>
                      <a href={post.link} target="_blank" rel="noopener"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2AABEE]/10 text-[#2AABEE] text-xs font-body font-bold hover:bg-[#2AABEE]/20 transition-colors">
                        <MessageCircle className="w-3.5 h-3.5" /> Telegram
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}

            {posts.length === 0 && (
              <div className="text-center py-20">
                <p className="font-body text-slate-500 text-xl">Постов не найдено</p>
              </div>
            )}

            {/* Link to channel */}
            <div className="text-center pt-6">
              <a href="https://t.me/Sweetsosquahub" target="_blank" rel="noopener"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#2AABEE]/15 border border-[#2AABEE]/25 text-[#2AABEE] font-body font-bold text-lg hover:bg-[#2AABEE]/25 transition-all">
                <MessageCircle className="w-5 h-5" /> Подписаться на канал
              </a>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .line-clamp-4 {
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        /* Стилизация HTML из Telegram */
        .tgme_widget_message_text a { color: #2AABEE; text-decoration: none; }
        .tgme_widget_message_text a:hover { text-decoration: underline; }
        .tgme_widget_message_text b, .tgme_widget_message_text strong { color: #fff; font-weight: 700; }
        .tgme_widget_message_text i, .tgme_widget_message_text em { color: #94a3b8; }
        .tgme_widget_message_text code { background: rgba(255,255,255,0.05); padding: 2px 6px; border-radius: 4px; font-family: 'JetBrains Mono', monospace; font-size: 0.875em; }
        .tgme_widget_message_text blockquote { border-left: 3px solid #2AABEE; padding-left: 12px; margin: 8px 0; color: #cbd5e1; }
      `}</style>
    </div>
  );
}
