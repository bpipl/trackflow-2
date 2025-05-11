
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { addDays, format, isToday, subDays } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DateRangeSelectorProps {
  startDate: Date;
  endDate: Date;
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
}

export function DateRangeSelector({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: DateRangeSelectorProps) {
  // Helper functions for quick date navigation
  const goToPreviousDay = () => {
    onStartDateChange(subDays(startDate, 1));
    onEndDateChange(subDays(endDate, 1));
  };

  const goToNextDay = () => {
    // Don't allow going to future dates
    const tomorrow = addDays(new Date(), 1);
    if (startDate < tomorrow) {
      onStartDateChange(addDays(startDate, 1));
      onEndDateChange(addDays(endDate, 1));
    }
  };

  const goToToday = () => {
    const today = new Date();
    onStartDateChange(today);
    onEndDateChange(today);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="grid gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date-from"
              variant="outline"
              className={cn(
                "w-[180px] justify-start text-left font-normal",
                !startDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? format(startDate, "PPP") : "Pick start date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={(date) => date && onStartDateChange(date)}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date-to"
              variant="outline"
              className={cn(
                "w-[180px] justify-start text-left font-normal",
                !endDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {endDate ? format(endDate, "PPP") : "Pick end date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 pointer-events-auto" align="end">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={(date) => date && onEndDateChange(date)}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Quick navigation buttons */}
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          size="icon"
          onClick={goToPreviousDay} 
          title="Previous day"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={goToToday} 
          className={cn(
            isToday(startDate) && isToday(endDate) ? "bg-blue-100" : "" 
          )}
          title="Today"
        >
          Today
        </Button>
        
        <Button 
          variant="outline" 
          size="icon"
          onClick={goToNextDay}
          disabled={isToday(endDate)} 
          title="Next day"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
