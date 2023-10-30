from datetime import date
from typing import Dict, List, Literal
import pandas as pd

from .data_funcs import date_range


def resample_and_aggregate(
    values: Dict[str, any],  # Keys should be date strings
    agg: Literal["daily", "weekly", "monthly"],
    avg_type=Literal["mean", "median"],
):
    # parse start_date and end_date to pandas datetime64
    start_date = pd.to_datetime(min(values.keys()))
    end_date = pd.to_datetime(max(values.keys()))

    if agg == "daily":
        return values
    df = pd.DataFrame(list(values.items()), columns=["date", "value"])
    df["date"] = pd.to_datetime(df["date"])

    # Set 'date' as index for resampling
    df.set_index("date", inplace=True)

    if agg == "monthly":
        df_agg = df.resample("M")
    else:
        df_agg = df.resample("W-SUN")

    df_agg = df_agg.mean() if avg_type == "mean" else df_agg.median()

    # Drop the first week or month if it is incomplete
    start_date = df.index.min()
    if start_date.weekday() != 6:  # 6 is Sunday
        df_agg = df_agg.iloc[1:]

    df_agg = df_agg.reset_index()
    df_agg.dropna(inplace=True)

    if agg == "weekly":
        # Pandas resample uses the end date of the range as the index. So we subtract 6 days to convert to first date of the range.
        df_agg["date"] = df_agg["date"] - pd.Timedelta(days=6)

    # drop any rows where date is not between start_date and end_date
    df_agg = df_agg[(df_agg["date"] >= start_date) & (df_agg["date"] <= end_date)].copy()

    df_agg["date"] = df_agg["date"].dt.strftime("%Y-%m-%d")

    return {row["date"]: row["value"] for _, row in df_agg.iterrows()}


def resample_list_of_values_with_range(
    values: List[any],
    start_date: date,
    end_date: date,
    agg: Literal["daily", "weekly", "monthly"],
    avg_type=Literal["mean", "median"],
):
    if agg == "daily":
        return agg
    dates = date_range(start_date, end_date)
    values_dict = {date: values[index] for index, date in enumerate(dates)}
    resampled = resample_and_aggregate(values_dict, agg, avg_type)
    return list(resampled.values())
