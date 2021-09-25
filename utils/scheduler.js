// The businesspeople among you will know that it's often not easy to find an
// appointment. In this kata we want to find such an appointment automatically.
// You will be given the calendars of our businessperson and a duration for the
// meeting. Your task is to find the earliest time, when every businessperson is
// free for at least that duration.
//
// Example Schedule:
//
// Person | Meetings
// -------+-----------------------------------------------------------
//      A | 09:00 - 11:30, 13:30 - 16:00, 16:00 - 17:30, 17:45 - 21:00
//      B | 09:15 - 12:00, 14:00 - 16:30, 17:00 - 17:30
//      C | 11:30 - 12:15, 15:00 - 16:30, 17:45 - 21:00
// Rules:
//
// All times in the calendars will be given in 24h format "hh:mm", the result
// must also be in that format
//
// A meeting is represented by its start time (inclusively) and end time
// (exclusively) -> if a meeting takes place from 09:00 - 11:00, the next
// possible start time would be 11:00
//
// The businesspeople work from 09:00 (inclusively) - 21:00 (exclusively), the
// appointment must start and end within that range.
//
// If the meeting does not fit into the schedules, return null or None as result
// The duration of the meeting will be provided as an integer in minutes
// Following these rules and looking at the example above the earliest time for
// a 60 minutes meeting would be 12:15.
//
// Data Format:
//
// The schedule will be provided as 3-dimensional array, in this format:
//
// var schedules = [
// [['09:00', '11:30'], ['13:30', '16:00'], ['16:00', '17:30'], ['17:45', '21:00]],
// [['09:15', '12:00'], ['14:00', '16:30'], ['17:00', '17:30']],
// [['11:30', '12:15'], ['15:00', '16:30'], ['17:45', '21:00']]
// ];

// -----------------------------------------------------------------------------
// SOLUTION
// -----------------------------------------------------------------------------

function getStartTime(schedules, duration) {
  var overlapRanges = getOverlaps(schedules);
  var available = overlapRanges.find(
    (range) => rangeToMinutes(range) >= duration
  );

  return (available && available[0]) || null;
}

/**
 * Given a time range in format ['09:15', '10:30'],
 * return the length of the range in minutes.
 * @param {Array<Number>} range
 * @return {Number} The minutes in the range
 */
function rangeToMinutes(range) {
  var minutes = 0;
  var start = range[0];
  var end = range[1];
  var startParts = start.split(":");
  var endParts = end.split(":");
  var startHour = +startParts[0];
  var endHour = +endParts[0];
  var startMins = +startParts[1];
  var endMins = +endParts[1];

  if (startHour !== endHour) {
    var hrMins = (endHour - startHour) * 60;
    minutes += hrMins;
  }

  if (startMins !== endMins) {
    minutes += endMins - startMins;
  }

  return minutes;
}

/**
 * Given a set of schedules of busy time ranges, return
 * the time range of availabilities common to all schedules.
 * @param {Array<Array>} schedules
 * @return {Array<Array>} Time ranges which are available.
 */
function getOverlaps(schedules) {
  var res = [];

  return schedules.reduce(
    (openSlots, schedule) => {
      var open = getOpenSlots(schedule);

      return intersectSchedules(openSlots, open);
    },
    [["09:00", "21:00"]]
  );

  return res;
}

/**
 * Given 2 sets of available times, return the times available in both schedules.
 * @param {Array<Array>} schedule1
 * @param {Array<Array>} schedule2
 * @return {Array<Array>}
 */
function intersectSchedules(schedule1, schedule2) {
  var res = [];

  schedule1.forEach((r1) => {
    schedule2.forEach((r2) => {
      var intersection = findIntersection(r1, r2);

      if (intersection) {
        res.push(intersection);
      }
    });
  });

  return res;
}

/**
 * Given 2 ranges, find the interesction.
 * @param {Array} a - 1st range e.g. ['11:30', '13:30']
 * @param {Array} b - 2nd range e.g. ['12:00', '14:00']
 * @return {Array} Interection range, or null if none.
 */
function findIntersection(a, b) {
  var min = a[0] < b[0] ? a : b;
  var max = min === a ? b : a;

  if (min[1] < max[0]) return null;

  return [max[0], min[1] < max[1] ? min[1] : max[1]];
}

/**
 * Given a schedule of meetings, find the oen slots.
 * @param {Array<Array>} schedule - busy times, e.g. [['09:00', '11:30'], ['13:30', '16:00']];
 * @return {Array<Array>} available times, e.g. [['11:30', '13:30'], ['16:00', '21:00']] in above case.
 */
function getOpenSlots(schedule) {
  var res = [];
  var head = schedule[0] && schedule[0][0];
  var tail = schedule[schedule.length - 1] && schedule[schedule.length - 1][1];

  // first slot
  if (head !== "09:00") {
    res.push(["09:00", head]);
  }

  schedule.forEach((curr, i) => {
    var prev = schedule[i - 1];
    var isTimeBetween = prev && prev[1] !== curr[0];

    if (i > 0 && isTimeBetween) {
      res.push([prev[1], curr[0]]);
    }
  });

  // last slot
  if (tail !== "21:00") {
    res.push([tail, "21:00"]);
  }

  return res;
}

function getTotalFreeTime(schedule) {
  const openSlots = getOpenSlots(schedule);
  const totalFreeTime = openSlots.reduce(
    (total, slot) => (total += rangeToMinutes(slot)),
    0
  );
  console.log(totalFreeTime);
}

function addMinutesTotime(time, min) {
  var t = time.split(":"), // convert to array [hh, mm, ss]
    h = Number(t[0]), // get hours
    m = Number(t[1]); // get minutes
  m += min % 60; // increment minutes
  h += Math.floor(min / 60); // increment hours
  if (m >= 60) {
    h++;
    m -= 60;
  } // if resulting minues > 60 then increment hours and balance as minutes

  return (
    (h + "").padStart(2, "0") +
    ":" + //create string padded with zeros for HH and MM
    (m + "").padStart(2, "0")
  ); // original seconds unchanged
}


// console.log(
//   getTotalFreeTime([
//     ["09:15", "12:00"],
//     ["14:00", "16:30"],
//     ["17:00", "17:30"],
//   ])
// );

console.log(
  getStartTime([
    [["13:00", "15:00"]],
    [
      ["9:00", "11:00"],
      ["13:00", "15:00"],
      ["15:20", "17:00"],
    ],
  ], 30)
);

export { getStartTime, getTotalFreeTime, addMinutesTotime };
