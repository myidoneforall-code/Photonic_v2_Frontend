import { Tooltip } from "antd";
import { FindAvilable } from "../../Utilities/Methods";
import commonstyle from "../../Assets/css/CommonStyle.module.css";

export default function BlurComponent({
  deviceData,
  navigateFunc,
  blurData = null
}) {
  function formatToINR(amount) {
    return (
      "₹" +
      amount.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    );
  }
  const parseFloatInt = (data, len = 2) => {
    return data
      ? data?.toString()?.includes(".")
        ? parseFloat(parseFloat(data?.toString()).toFixed(2))
        : parseInt(data?.toString())
      : 0;
  };

  const getAmcMsg = () => {
    return {
      amc_msg: blurData ? blurData?.amc_msg : deviceData || "",
      amc_cost: deviceData ? deviceData?.amc_cost : blurData?.amc_cost || ""
    };
  };
  console.log(
    "BlurComponent",
    blurData,
    deviceData,
    getAmcMsg()?.amc_msg?.not_show_charge === 1
  );
  return (
    <div
      onClick={() => {
        navigateFunc?.();
      }}
      className={
        (
          blurData
            ? blurData.show && blurData.id
            : FindAvilable(deviceData).show
        )
          ? "blurData"
          : "hideDiv"
      }
    >
      <div className="d-flex gap-3 justify-content-between align-items-start">
        <Tooltip
          title={
            (blurData ? blurData.name : FindAvilable(deviceData)?.data?.name) ||
            ""
          }
        >
          <p className={commonstyle.item_name}>
            {blurData ? blurData.name : FindAvilable(deviceData)?.data?.name}
          </p>
        </Tooltip>

        <p className="blurID">
          ID -{blurData ? blurData.id : FindAvilable(deviceData)?.data?.id}
        </p>
      </div>
      <div className="blurContant">
        <p className="expired_batch">Service Expired</p>
        <span>
          {blurData
            ? blurData.amc_msg
            : FindAvilable(deviceData)?.data?.amc_msg}
        </span>

        <div>
          {
            // Number(blurData?.not_show_charge) !== 1 &&
            getAmcMsg()?.amc_msg?.not_show_charge !== 1 &&
              getAmcMsg()?.amc_msg?.not_show_charge && (
                <p
                  style={{
                    textAlign: "center",
                    fontWeight: "bold",
                    fontSize: 20
                  }}
                >
                  {formatToINR(parseFloatInt(getAmcMsg()?.amc_cost || "0"))}
                </p>
              )
          }
          {/* {blurData?.not_show_pay !== 1 && (
            <div
              onPress={() => {
                // if (onPaymentSuccess) onPaymentSuccess();
                // setisLoading(pre => ({
                //   status: true,
                //   text: 'Payment Processing...',
                // }));
                //  handleGetPaymentOrderId();
              }}
              className="d-flex justify-content-center align-items-center"
            >
              <p
                className={commonstyle.item_name}
                style={{ width: "4em", padding: "4px 16px" }}
              >
                Pay
              </p>
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
}
