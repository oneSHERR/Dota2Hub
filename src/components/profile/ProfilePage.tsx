import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { logoutUser, getUserMatches, searchUsers, sendFriendRequest, acceptFriendRequest, getUserProfile } from '@/firebase';
import { ref, onValue } from 'firebase/database';
import { db } from '@/firebase';
import { Trophy, Target, XCircle, Minus, LogOut, Search, UserPlus, Check, Clock, Users, Swords, ChevronRight } from 'lucide-react';

export function ProfilePage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [matches, setMatches] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [tab, setTab] = useState<'stats' | 'friends' | 'history'>('stats');

  useEffect(() => {
    if (!user) return;

    // Load matches
    getUserMatches(user.uid).then(setMatches);

    // Subscribe to friend requests
    const reqRef = ref(db, `friendRequests/${user.uid}`);
    const unsub = onValue(reqRef, async (snap) => {
      const data = snap.val();
      if (!data) { setFriendRequests([]); return; }
      const reqs = await Promise.all(
        Object.entries(data).map(async ([uid, info]: [string, any]) => {
          const profile = await getUserProfile(uid);
          return { uid, name: profile?.displayName || 'Unknown', ...info };
        })
      );
      setFriendRequests(reqs);
    });

    // Load friends
    if (profile?.friends) {
      Promise.all(
        Object.keys(profile.friends).map(async (uid) => {
          const p = await getUserProfile(uid);
          return { uid, ...p };
        })
      ).then(setFriends);
    }

    return unsub;
  }, [user, profile]);

  const handleLogout = async () => {
    await logoutUser();
    navigate('/');
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    const results = await searchUsers(searchQuery);
    setSearchResults(results.filter((r: any) => r.uid !== user?.uid));
  };

  const handleAddFriend = async (friendUid: string) => {
    if (!user) return;
    await sendFriendRequest(user.uid, friendUid);
    setSearchResults(prev => prev.filter(r => r.uid !== friendUid));
  };

  const handleAcceptRequest = async (friendUid: string) => {
    if (!user) return;
    await acceptFriendRequest(user.uid, friendUid);
    setFriendRequests(prev => prev.filter(r => r.uid !== friendUid));
  };

  if (!user) {
    navigate('/auth');
    return null;
  }

  const stats = profile?.stats || { wins: 0, losses: 0, draws: 0 };
  const totalGames = stats.wins + stats.losses + stats.draws;
  const winRate = totalGames > 0 ? Math.round((stats.wins / totalGames) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile header */}
      <div className="rounded-2xl bg-dota-card border border-dota-border p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-dota-gold to-dota-accent flex items-center justify-center shadow-lg">
              <span className="text-2xl font-display font-bold text-white">
                {user.displayName?.[0]?.toUpperCase() || '?'}
              </span>
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-white">{user.displayName}</h1>
              <p className="text-xs font-body text-slate-500">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-slate-400 text-sm font-body hover:bg-slate-700 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" /> Выйти
          </button>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-4 gap-3 mt-6">
          <StatCard icon={Swords} value={totalGames} label="Игр" />
          <StatCard icon={Trophy} value={stats.wins} label="Побед" color="text-green-400" />
          <StatCard icon={XCircle} value={stats.losses} label="Поражений" color="text-red-400" />
          <StatCard icon={Target} value={`${winRate}%`} label="Винрейт" color="text-dota-gold" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 p-1 rounded-xl bg-dota-card border border-dota-border w-fit">
        {[
          { key: 'stats' as const, label: 'Статистика', icon: Target },
          { key: 'friends' as const, label: 'Друзья', icon: Users },
          { key: 'history' as const, label: 'История', icon: Clock },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-body font-medium transition-all ${
              tab === key ? 'bg-dota-accent/15 text-dota-accent' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* Stats tab */}
      {tab === 'stats' && (
        <div className="rounded-2xl bg-dota-card border border-dota-border p-6">
          <h3 className="font-display text-lg font-bold text-white mb-4">Общая статистика</h3>

          {totalGames > 0 ? (
            <div className="space-y-4">
              {/* Win rate bar */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-body text-green-400">Победы: {stats.wins}</span>
                  <span className="text-sm font-body text-red-400">Поражения: {stats.losses}</span>
                </div>
                <div className="h-6 rounded-full bg-dota-bg overflow-hidden flex">
                  <div className="h-full bg-green-600" style={{ width: `${(stats.wins / totalGames) * 100}%` }} />
                  <div className="h-full bg-slate-700" style={{ width: `${(stats.draws / totalGames) * 100}%` }} />
                  <div className="h-full bg-red-700" style={{ width: `${(stats.losses / totalGames) * 100}%` }} />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Swords className="w-8 h-8 text-slate-600 mx-auto mb-3" />
              <p className="font-body text-slate-500">Пока нет игр. Начни играть в Draft Arena!</p>
            </div>
          )}
        </div>
      )}

      {/* Friends tab */}
      {tab === 'friends' && (
        <div className="space-y-4">
          {/* Search users */}
          <div className="rounded-2xl bg-dota-card border border-dota-border p-5">
            <h3 className="font-display text-lg font-bold text-white mb-3">Найти друзей</h3>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  placeholder="Поиск по имени..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-dota-bg border border-dota-border text-white font-body text-sm placeholder:text-slate-600 focus:outline-none focus:border-dota-accent/50"
                />
              </div>
              <button onClick={handleSearch} className="px-4 py-2.5 rounded-xl bg-dota-accent text-white font-body text-sm font-bold hover:bg-red-600 transition-colors">
                Найти
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="mt-3 space-y-2">
                {searchResults.map((u: any) => (
                  <div key={u.uid} className="flex items-center justify-between p-3 rounded-xl bg-dota-bg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                        <span className="text-xs font-bold text-white">{u.displayName?.[0]}</span>
                      </div>
                      <span className="font-body text-sm text-white">{u.displayName}</span>
                    </div>
                    <button
                      onClick={() => handleAddFriend(u.uid)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-400 text-xs font-body hover:bg-blue-600/30 transition-colors"
                    >
                      <UserPlus className="w-3 h-3" /> Добавить
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Friend requests */}
          {friendRequests.length > 0 && (
            <div className="rounded-2xl bg-dota-card border border-dota-gold/30 p-5">
              <h3 className="font-display text-lg font-bold text-white mb-3">
                Заявки в друзья ({friendRequests.length})
              </h3>
              <div className="space-y-2">
                {friendRequests.map((req: any) => (
                  <div key={req.uid} className="flex items-center justify-between p-3 rounded-xl bg-dota-bg">
                    <span className="font-body text-sm text-white">{req.name}</span>
                    <button
                      onClick={() => handleAcceptRequest(req.uid)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-600/20 text-green-400 text-xs font-body hover:bg-green-600/30 transition-colors"
                    >
                      <Check className="w-3 h-3" /> Принять
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Friends list */}
          <div className="rounded-2xl bg-dota-card border border-dota-border p-5">
            <h3 className="font-display text-lg font-bold text-white mb-3">
              Друзья ({friends.length})
            </h3>
            {friends.length > 0 ? (
              <div className="space-y-2">
                {friends.map((f: any) => (
                  <div key={f.uid} className="flex items-center gap-3 p-3 rounded-xl bg-dota-bg">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-dota-gold to-dota-accent flex items-center justify-center">
                      <span className="text-xs font-bold text-white">{f.displayName?.[0]}</span>
                    </div>
                    <div className="flex-1">
                      <span className="font-body text-sm text-white">{f.displayName}</span>
                      <div className="text-[10px] font-body text-slate-500">
                        {f.stats?.wins || 0}W / {f.stats?.losses || 0}L
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm font-body text-slate-500 text-center py-4">
                Пока нет друзей. Найди их через поиск!
              </p>
            )}
          </div>
        </div>
      )}

      {/* History tab */}
      {tab === 'history' && (
        <div className="rounded-2xl bg-dota-card border border-dota-border p-5">
          <h3 className="font-display text-lg font-bold text-white mb-4">История матчей</h3>
          {matches.length > 0 ? (
            <div className="space-y-2">
              {matches.slice(0, 20).map((m: any) => {
                const isP1 = m.player1Uid === user?.uid;
                const won = (m.winner === 'player1' && isP1) || (m.winner === 'player2' && !isP1);
                const isDraw = m.winner === 'draw';

                return (
                  <div key={m.id} className={`flex items-center gap-4 p-3 rounded-xl bg-dota-bg border ${
                    isDraw ? 'border-slate-700' : won ? 'border-green-500/20' : 'border-red-500/20'
                  }`}>
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isDraw ? 'bg-slate-700' : won ? 'bg-green-600/20' : 'bg-red-600/20'
                    }`}>
                      {isDraw ? (
                        <Minus className="w-5 h-5 text-slate-400" />
                      ) : won ? (
                        <Trophy className="w-5 h-5 text-green-400" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-body text-white">
                        vs {isP1 ? m.player2Name : m.player1Name}
                      </span>
                      <div className="text-[10px] font-body text-slate-500">
                        {new Date(m.timestamp).toLocaleDateString('ru-RU')}
                      </div>
                    </div>
                    <span className={`text-xs font-body font-bold ${
                      isDraw ? 'text-slate-400' : won ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {isDraw ? 'Ничья' : won ? 'Победа' : 'Поражение'}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="w-8 h-8 text-slate-600 mx-auto mb-3" />
              <p className="font-body text-slate-500">История пуста</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, value, label, color }: { icon: any; value: any; label: string; color?: string }) {
  return (
    <div className="rounded-xl bg-dota-bg p-3 text-center">
      <Icon className={`w-4 h-4 mx-auto mb-1 ${color || 'text-slate-400'}`} />
      <div className={`font-display text-xl font-bold ${color || 'text-white'}`}>{value}</div>
      <div className="text-[10px] font-body text-slate-500">{label}</div>
    </div>
  );
}
