import moment, { Moment } from 'moment';

// ---------- Formatting ----------

export const formatTimestamp = (date: Date): string => {
   return moment(date).format('YYYY-MM-DD HH:mm:ss');
};

export const formatDate = (date: Date): string => {
   return moment(date).format('YYYY-MM-DD');
};

export const formatTime = (date: Date): string => {
   return moment(date).format('HH:mm:ss');
};

export const formatCustom = (date: Date, pattern: string): string => {
   return moment(date).format(pattern);
};

export const toISO = (date: Date): string => {
   return moment(date).toISOString();
};

export const toUnix = (date: Date): number => {
   return moment(date).unix();
};

export const fromUnix = (timestamp: number): Date => {
   return moment.unix(timestamp).toDate();
};

// ---------- Parsing ----------

export const parseDate = (value: string, pattern?: string): Date => {
   return pattern ? moment(value, pattern).toDate() : moment(value).toDate();
};

export const isValidDate = (value: string, pattern?: string): boolean => {
   return pattern ? moment(value, pattern, true).isValid() : moment(value).isValid();
};

// ---------- Current / Cloning ----------

export const now = (): Date => moment().toDate();

export const cloneDate = (date: Date): Date => {
   return moment(date).clone().toDate();
};

// ---------- Arithmetic ----------

export const addDays = (date: Date, days: number): Date => {
   return moment(date).add(days, 'days').toDate();
};

export const subtractDays = (date: Date, days: number): Date => {
   return moment(date).subtract(days, 'days').toDate();
};

export const addMonths = (date: Date, months: number): Date => {
   return moment(date).add(months, 'months').toDate();
};

export const subtractMonths = (date: Date, months: number): Date => {
   return moment(date).subtract(months, 'months').toDate();
};

export const addYears = (date: Date, years: number): Date => {
   return moment(date).add(years, 'years').toDate();
};

export const addMinutes = (date: Date, minutes: number): Date => {
   return moment(date).add(minutes, 'minutes').toDate();
};

export const addHours = (date: Date, hours: number): Date => {
   return moment(date).add(hours, 'hours').toDate();
};

// ---------- Comparisons ----------

export const isBefore = (date: Date, compareTo: Date): boolean => {
   return moment(date).isBefore(compareTo);
};

export const isAfter = (date: Date, compareTo: Date): boolean => {
   return moment(date).isAfter(compareTo);
};

export const isSameDay = (date: Date, compareTo: Date): boolean => {
   return moment(date).isSame(compareTo, 'day');
};

export const isBetween = (date: Date, start: Date, end: Date): boolean => {
   return moment(date).isBetween(start, end, undefined, '[]');
};

export const isToday = (date: Date): boolean => {
   return moment(date).isSame(moment(), 'day');
};

export const isPast = (date: Date): boolean => {
   return moment(date).isBefore(moment());
};

export const isFuture = (date: Date): boolean => {
   return moment(date).isAfter(moment());
};

export const isWeekend = (date: Date): boolean => {
   const day = moment(date).day();
   return day === 0 || day === 6;
};

// ---------- Diffs ----------

export const diffInDays = (date: Date, compareTo: Date): number => {
   return moment(date).diff(moment(compareTo), 'days');
};

export const diffInHours = (date: Date, compareTo: Date): number => {
   return moment(date).diff(moment(compareTo), 'hours');
};

export const diffInMinutes = (date: Date, compareTo: Date): number => {
   return moment(date).diff(moment(compareTo), 'minutes');
};

export const getAge = (birthDate: Date): number => {
   return moment().diff(moment(birthDate), 'years');
};

// ---------- Start / End boundaries ----------

export const startOfDay = (date: Date): Date => {
   return moment(date).startOf('day').toDate();
};

export const endOfDay = (date: Date): Date => {
   return moment(date).endOf('day').toDate();
};

export const startOfWeek = (date: Date): Date => {
   return moment(date).startOf('week').toDate();
};

export const endOfWeek = (date: Date): Date => {
   return moment(date).endOf('week').toDate();
};

export const startOfMonth = (date: Date): Date => {
   return moment(date).startOf('month').toDate();
};

export const endOfMonth = (date: Date): Date => {
   return moment(date).endOf('month').toDate();
};

// ---------- Descriptive ----------

export const fromNow = (date: Date): string => {
   return moment(date).fromNow();
};

export const toNow = (date: Date): string => {
   return moment(date).toNow();
};

export const getWeekday = (date: Date): string => {
   return moment(date).format('dddd');
};

export const getMonthName = (date: Date): string => {
   return moment(date).format('MMMM');
};