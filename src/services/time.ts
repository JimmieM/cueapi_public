import moment from 'moment-timezone';

export namespace TimeService {
    export const DateTime = () => {
        return moment()
            .tz('Europe/Stockholm')
            .format()
            .slice(0, 19)
            .replace('T', ' ');
    };

    export const timeAgo = (date: Date) => {
        const ms = new Date(TimeService.DateTime()).getTime() - date.getTime();
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const months = Math.floor(days / 30);
        const years = Math.floor(months / 12);

        if (ms === 0) {
            return 'Nu';
        }
        if (seconds < 60) {
            return seconds + ' s';
        }
        if (minutes < 60) {
            return minutes + ' min';
        }
        if (hours < 24) {
            return hours + ' h';
        }
        if (days < 30) {
            return days + ' d';
        }
        if (months < 12) {
            return months + ' m';
        } else {
            return years + ' år';
        }
    };
}
