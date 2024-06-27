import { useMemo } from "react";
import { Navigate } from "react-big-calendar";
import PropTypes from "prop-types";
import TimeGrid from "react-big-calendar/lib/TimeGrid";

function WeekdaysView({
  date,
  localizer,
  max = localizer.endOf(new Date(), "day"),
  min = localizer.startOf(new Date(), "day"),
  scrollToTime = localizer.startOf(new Date(), "day"),
  ...props
}) {
  const currRange = useMemo(
    () => WeekdaysView.range(date, { localizer }),
    [date, localizer]
  );

  return (
    <TimeGrid
      date={date}
      localizer={localizer}
      max={max}
      min={min}
      range={currRange}
      scrollToTime={scrollToTime}
      {...props}
    />
  );
}

WeekdaysView.propTypes = {
  date: PropTypes.instanceOf(Date).isRequired,
  localizer: PropTypes.object,
  max: PropTypes.instanceOf(Date),
  min: PropTypes.instanceOf(Date),
  scrollToTime: PropTypes.instanceOf(Date),
};

WeekdaysView.range = (date, { localizer }) => {
  const start = localizer.add(localizer.startOf(date, "week"), 1, "day");
  const end = localizer.add(start, 4, "day");

  let current = start;
  const range = [];

  while (localizer.lte(current, end, "day")) {
    range.push(current);
    current = localizer.add(current, 1, "day");
  }

  return range;
};

WeekdaysView.navigate = (date, action, { localizer }) => {
  switch (action) {
    case Navigate.PREVIOUS:
      return localizer.add(date, -7, "day");

    case Navigate.NEXT:
      return localizer.add(date, 7, "day");

    default:
      return date;
  }
};

WeekdaysView.title = (date, { localizer }) => {
  const [start, ...rest] = WeekdaysView.range(date, { localizer });
  return localizer.format({ start, end: rest.pop() }, "dayRangeHeaderFormat");
};

export default WeekdaysView;
