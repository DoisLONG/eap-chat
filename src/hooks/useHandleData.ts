// useHandleData.ts
import { ElMessageBox, ElMessage } from "element-plus";
import { HandleData } from "./interface";

/**
 * @description 操作单条数据信息 (二次确认【删除、禁用、启用、重置密码】)
 * @param {Function} api 操作数据接口的api方法 (必传)
 * @param {Object} params 携带的操作数据参数 {id,params} (必传)
 * @param {String} message 提示信息 (必传)
 * @param {Function} t 国际化函数 (必传)
 * @param {String} confirmType icon类型 (不必传,默认为 warning)
 * @returns {Promise}
 */
export const useHandleData = (
  api: (params: any) => Promise<any>,
  params: any = {},
  message: string,
  t: Function, // 添加 t 函数参数
  confirmType: HandleData.MessageType = "warning",
  successMessage?: string
) => {
  return new Promise((resolve, reject) => {
    ElMessageBox.confirm(`${message}`, t("header.tip"), {
      confirmButtonText: t("common.confirm"),
      cancelButtonText: t("common.cancel"),
      type: confirmType,
      draggable: true,
    })
      .then(async () => {
        const res = await api(params);
        if (!res) return reject(false);
        if (
          (res.data.status && res.data.status !== 200) ||
          (res.data.code && res.data.code !== 0)
        ) {
          ElMessage({
            type: "error",
            message: res.data.message,
          });
        } else {
          ElMessage({
            type: "success",
            message: successMessage || t("common.operateSuccess"),
          });
        }
        resolve(true);
      })
      .catch(() => {
        // cancel operation
      });
  });
};
