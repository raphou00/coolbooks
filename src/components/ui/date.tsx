import { format } from "date-fns";

type DateProps = {
    date: string | number | Date;
};

const Date: React.FC<DateProps> = ({ date }) => {
    return (
        <time dateTime={date.toString()}>{format(date, "LLLL d, yyyy")}</time>
    );
};

export default Date;
