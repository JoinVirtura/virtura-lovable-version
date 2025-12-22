import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO, addMonths, subMonths } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar, List } from 'lucide-react';
import { CalendarDayCell } from './CalendarDayCell';
import { ScheduledPostPreview } from './ScheduledPostPreview';

interface ScheduledPost {
  id: string;
  caption: string;
  media_urls: any;
  scheduled_for: string;
  platforms: string[];
  status: string;
  is_paid: boolean;
  price_cents: number;
}

interface SmartCalendarProps {
  posts: ScheduledPost[];
  onPublishNow: (id: string) => void;
  onDelete: (id: string) => void;
  onReschedule?: (id: string, newDate: Date) => void;
}

export function SmartCalendar({ posts, onPublishNow, onDelete }: SmartCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [view, setView] = useState<'calendar' | 'list'>('calendar');

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getPostsForDate = (date: Date) => {
    return posts.filter(post => 
      isSameDay(parseISO(post.scheduled_for), date)
    );
  };

  const selectedDatePosts = selectedDate ? getPostsForDate(selectedDate) : [];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
      {/* Calendar/List View */}
      <Card className="lg:col-span-2 p-3 sm:p-6 bg-gradient-to-br from-card/90 to-card/50 backdrop-blur-xl border-primary/20">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-primary to-primary-blue bg-clip-text text-transparent">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
          </div>
          
          <div className="flex items-center justify-between sm:justify-end gap-2">
            {/* View Toggle */}
            <div className="flex bg-muted/50 rounded-lg p-1">
              <Button
                variant={view === 'calendar' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setView('calendar')}
                className="rounded-md h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"
              >
                <Calendar className="w-4 h-4" />
              </Button>
              <Button
                variant={view === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setView('list')}
                className="rounded-md h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>

            {/* Month Navigation */}
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                className="border-primary/20 h-8 w-8 sm:h-9 sm:w-9"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
                className="border-primary/20 h-8 px-2 sm:h-9 sm:px-3 text-xs sm:text-sm"
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                className="border-primary/20 h-8 w-8 sm:h-9 sm:w-9"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {view === 'calendar' ? (
          <>
            {/* Week Days Header */}
            <div className="grid grid-cols-7 gap-0.5 sm:gap-2 mb-1 sm:mb-2">
              {weekDays.map((day, i) => (
                <div key={day} className="text-center text-[10px] sm:text-sm font-semibold text-muted-foreground py-1 sm:py-2">
                  <span className="hidden sm:inline">{day}</span>
                  <span className="sm:hidden">{day.charAt(0)}</span>
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-0.5 sm:gap-2">
              {days.map((day, idx) => {
                const dayPosts = getPostsForDate(day);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isToday = isSameDay(day, new Date());
                
                return (
                  <CalendarDayCell
                    key={idx}
                    date={day}
                    posts={dayPosts}
                    isCurrentMonth={isSameMonth(day, currentDate)}
                    isSelected={isSelected}
                    isToday={isToday}
                    onClick={() => setSelectedDate(day)}
                  />
                );
              })}
            </div>
          </>
        ) : (
          /* List View */
          <div className="space-y-4">
            {posts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No scheduled posts</p>
              </div>
            ) : (
              posts.map(post => (
                <ScheduledPostPreview
                  key={post.id}
                  post={post}
                  onPublishNow={onPublishNow}
                  onDelete={onDelete}
                />
              ))
            )}
          </div>
        )}
      </Card>

      {/* Selected Date Posts Sidebar */}
      <Card className="p-4 sm:p-6 bg-gradient-to-br from-card/90 to-card/50 backdrop-blur-xl border-primary/20">
        <div className="mb-3 sm:mb-4">
          <h3 className="text-base sm:text-lg font-semibold mb-1">
            {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
          </h3>
          {selectedDate && (
            <Badge variant="secondary" className="text-xs">
              {selectedDatePosts.length} {selectedDatePosts.length === 1 ? 'post' : 'posts'}
            </Badge>
          )}
        </div>

        <div className="space-y-2 sm:space-y-3">
          {selectedDate && selectedDatePosts.length > 0 ? (
            selectedDatePosts.map(post => (
              <ScheduledPostPreview
                key={post.id}
                post={post}
                onPublishNow={onPublishNow}
                onDelete={onDelete}
                compact
              />
            ))
          ) : (
            <div className="text-center py-6 sm:py-8 text-muted-foreground text-xs sm:text-sm">
              {selectedDate ? 'No posts scheduled for this day' : 'Click on a date to see scheduled posts'}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}