const fs = require('fs');
let content = fs.readFileSync('frontend/src/pages/RoomChatPage.tsx', 'utf8');

const target = `<div className="text-sm font-medium flex items-center gap-1.5">
                              <span className="text-white">{m.username}</span>
                              {m.id === room?.ownerId && (
                                <span className="text-[9px] bg-purple-900/60 text-purple-200 border border-purple-700/50 px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider">Owner</span>
                              )}
                              {room?.admins?.includes(m.id) && m.id !== room?.ownerId && (
                                <span className="text-[9px] bg-blue-900/60 text-blue-200 border border-blue-700/50 px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider">Admin</span>
                              )}
                              {room?.moderators?.includes(m.id) && (
                                <span className="text-[9px] bg-emerald-900/60 text-emerald-200 border border-emerald-700/50 px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider">Mod</span>
                              )}
                            </div>`;

const replacement = `<div className="flex flex-col">
                            <div className="text-sm font-medium flex items-center gap-1.5">
                              <span className="text-white">{m.username}</span>
                              {m.id === room?.ownerId && (
                                <span className="text-[9px] bg-purple-900/60 text-purple-200 border border-purple-700/50 px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider">Owner</span>
                              )}
                              {room?.admins?.includes(m.id) && m.id !== room?.ownerId && (
                                <span className="text-[9px] bg-blue-900/60 text-blue-200 border border-blue-700/50 px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider">Admin</span>
                              )}
                              {room?.moderators?.includes(m.id) && (
                                <span className="text-[9px] bg-emerald-900/60 text-emerald-200 border border-emerald-700/50 px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider">Mod</span>
                              )}
                            </div>
                            {user?.id && (room?.ownerId === user.id || room?.admins?.includes(user.id) || room?.moderators?.includes(user.id)) && user.id !== m.id && (
                              <div className="hidden group-hover:flex gap-1 mt-1">
                                {(room?.ownerId === user.id || room?.admins?.includes(user.id)) && (
                                  <>
                                    <button onClick={(e) => { e.stopPropagation(); handleMemberAction(m.id, 'kick'); }} className="text-[9px] bg-yellow-900/60 text-yellow-200 border border-yellow-700/50 px-1.5 py-0.5 rounded font-semibold hover:bg-yellow-800 transition">Kick</button>
                                    <button onClick={(e) => { e.stopPropagation(); handleMemberAction(m.id, 'ban'); }} className="text-[9px] bg-red-900/60 text-red-200 border border-red-700/50 px-1.5 py-0.5 rounded font-semibold hover:bg-red-800 transition">Ban</button>
                                  </>
                                )}
                                {room?.ownerId === user.id && !room?.admins?.includes(m.id) && (
                                  <button onClick={(e) => { e.stopPropagation(); handleMemberAction(m.id, 'promote_admin'); }} className="text-[9px] bg-blue-900/60 text-blue-200 border border-blue-700/50 px-1.5 py-0.5 rounded font-semibold hover:bg-blue-800 transition">Admin</button>
                                )}
                              </div>
                            )}
                            </div>`;

content = content.split(target).join(replacement);
fs.writeFileSync('frontend/src/pages/RoomChatPage.tsx', content);
console.log('Replaced successfully');
