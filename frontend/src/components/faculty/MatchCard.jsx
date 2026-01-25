import React from 'react';
import { Package, MapPin, Calendar, User, Sparkles, ArrowRight, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { sendBulkNotifications, generateVariables } from '../../services/notification.service';

const MatchCard = ({ match }) => {
    const { lostItem, foundItem, score } = match;

    // Get confidence level styling
    const getConfidenceStyle = (score) => {
        if (score >= 80) {
            return {
                bg: 'bg-emerald-500/10',
                text: 'text-emerald-600',
                border: 'border-emerald-500/30',
                label: 'Excellent Match'
            };
        } else if (score >= 60) {
            return {
                bg: 'bg-amber-500/10',
                text: 'text-amber-600',
                border: 'border-amber-500/30',
                label: 'Good Match'
            };
        } else {
            return {
                bg: 'bg-blue-500/10',
                text: 'text-blue-600',
                border: 'border-blue-500/30',
                label: 'Possible Match'
            };
        }
    };

    const confidenceStyle = getConfidenceStyle(score);

    const formatDate = (date) => {
        if (!date) return 'N/A';
        const d = date?.toDate ? date.toDate() : new Date(date);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const handleNotifyStudents = () => {
        if (!confirm('Notify both students about this potential match?')) {
            return;
        }

        const recipients = [];
        const variablesArray = [];

        // 1. Notify student who lost the item
        if (lostItem.reportedBy && lostItem.reportedBy.email) {
            recipients.push(lostItem.reportedBy);
            variablesArray.push({
                studentName: lostItem.reportedBy.name || 'Student',
                itemType: 'Lost',
                yourItem: lostItem.title,
                yourDate: formatDate(lostItem.createdAt),
                matchedItem: foundItem.title,
                matchScore: score,
                otherStudentName: foundItem.reportedBy?.name || 'A student',
                oppositeAction: 'finding',
                portalUrl: window.location.origin
            });
        }

        // 2. Notify student who found the item
        if (foundItem.reportedBy && foundItem.reportedBy.email) {
            recipients.push(foundItem.reportedBy);
            variablesArray.push({
                studentName: foundItem.reportedBy.name || 'Student',
                itemType: 'Found',
                yourItem: foundItem.title,
                yourDate: formatDate(foundItem.createdAt),
                matchedItem: lostItem.title,
                matchScore: score,
                otherStudentName: lostItem.reportedBy?.name || 'A student',
                oppositeAction: 'losing',
                portalUrl: window.location.origin
            });
        }

        if (recipients.length > 0) {
            sendBulkNotifications(recipients, 'match_found', variablesArray);
        } else {
            alert('No student emails available for notification.');
        }
    };

    return (
        <div className={`glass-card p-6 border-2 ${confidenceStyle.border} hover:shadow-lg transition-all group`}>
            {/* Match Score Badge */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                    <Sparkles size={20} className={confidenceStyle.text} />
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                        {confidenceStyle.label}
                    </span>
                </div>
                <div className={`px-4 py-2 rounded-full ${confidenceStyle.bg} ${confidenceStyle.text} font-black text-lg`}>
                    {score}%
                </div>
            </div>

            {/* Items Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Lost Item */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="px-3 py-1 bg-red-500/10 text-red-600 rounded-full text-xs font-black uppercase">
                            Lost
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {lostItem.images && lostItem.images.length > 0 ? (
                                <img src={lostItem.images[0]} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <Package size={20} className="text-slate-400" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm truncate">{lostItem.title}</h4>
                            <p className="text-xs text-slate-500 truncate">{lostItem.category}</p>
                        </div>
                    </div>

                    <div className="space-y-2 text-xs">
                        {lostItem.color && (
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-4 h-4 rounded-full border-2 border-slate-300"
                                    style={{ backgroundColor: lostItem.color.toLowerCase() }}
                                ></div>
                                <span className="text-slate-600 dark:text-slate-400 capitalize">{lostItem.color}</span>
                            </div>
                        )}

                        {lostItem.location && (
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                <MapPin size={14} className="text-slate-400" />
                                <span className="truncate">{lostItem.location}</span>
                            </div>
                        )}

                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                            <Calendar size={14} className="text-slate-400" />
                            <span>{formatDate(lostItem.createdAt)}</span>
                        </div>

                        {lostItem.reportedBy && (
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                <User size={14} className="text-slate-400" />
                                <span className="truncate">{lostItem.reportedBy.name || 'Student'}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Arrow / Connector */}
                <div className="hidden md:flex items-center justify-center">
                    <ArrowRight size={24} className={`${confidenceStyle.text} animate-pulse`} />
                </div>

                {/* Found Item */}
                <div className="space-y-3 md:border-l-2 md:border-dashed md:border-slate-200 dark:md:border-slate-700 md:pl-6">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="px-3 py-1 bg-green-500/10 text-green-600 rounded-full text-xs font-black uppercase">
                            Found
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {foundItem.images && foundItem.images.length > 0 ? (
                                <img src={foundItem.images[0]} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <Package size={20} className="text-slate-400" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm truncate">{foundItem.title}</h4>
                            <p className="text-xs text-slate-500 truncate">{foundItem.category}</p>
                        </div>
                    </div>

                    <div className="space-y-2 text-xs">
                        {foundItem.color && (
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-4 h-4 rounded-full border-2 border-slate-300"
                                    style={{ backgroundColor: foundItem.color.toLowerCase() }}
                                ></div>
                                <span className="text-slate-600 dark:text-slate-400 capitalize">{foundItem.color}</span>
                            </div>
                        )}

                        {foundItem.location && (
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                <MapPin size={14} className="text-slate-400" />
                                <span className="truncate">{foundItem.location}</span>
                            </div>
                        )}

                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                            <Calendar size={14} className="text-slate-400" />
                            <span>{formatDate(foundItem.createdAt)}</span>
                        </div>

                        {foundItem.reportedBy && (
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                <User size={14} className="text-slate-400" />
                                <span className="truncate">{foundItem.reportedBy.name || 'Student'}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                    onClick={handleNotifyStudents}
                    className={`btn ${confidenceStyle.bg} ${confidenceStyle.text} border-2 ${confidenceStyle.border} px-6 py-2.5 font-bold text-sm flex items-center justify-center gap-2 hover:shadow-lg transition-all flex-1`}
                >
                    <Mail size={16} />
                    Notify Both Students
                </button>

                <Link
                    to={`/faculty/items`}
                    className="btn bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-6 py-2.5 font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                    View Details
                </Link>
            </div>

            {/* Match Explanation (Tooltip/Expandable) */}
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <details className="text-xs text-slate-500">
                    <summary className="cursor-pointer font-bold hover:text-slate-700 dark:hover:text-slate-300">
                        Why {score}% match? (Show breakdown)
                    </summary>
                    <div className="mt-2 space-y-1 pl-4">
                        <p>• Category: {lostItem.category === foundItem.category ? '✓ Match' : '− Different'}</p>
                        <p>• Color: {lostItem.color?.toLowerCase() === foundItem.color?.toLowerCase() ? '✓ Match' : '− Different'}</p>
                        <p>• Location: {lostItem.location && foundItem.location && lostItem.location.toLowerCase().includes(foundItem.location.toLowerCase().split(' ')[0]) ? '✓ Similar' : '− Different'}</p>
                        <p>• Timing: Within {Math.ceil(Math.abs((lostItem.createdAt?.toDate?.() || new Date()) - (foundItem.createdAt?.toDate?.() || new Date())) / (1000 * 60 * 60 * 24))} days</p>
                    </div>
                </details>
            </div>
        </div>
    );
};

export default MatchCard;
