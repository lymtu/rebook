import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { AuthInfoType, useAuthContext } from "@/lib/context/auth/authContext";
import { useAlertContext } from "@/lib/context/alert/alertContext";
import { useErrorHandle, useResponseHandle } from "@/lib/utils/responseHandle";

export default function SignIn() {
  const navigate = useNavigate();
  const usernameInputElement = useRef<HTMLInputElement>(null);
  const passwordInputElement = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { setInfo } = useAuthContext();
  const { addAlert } = useAlertContext();

  const errorHandle = useErrorHandle();
  const responseHandle = useResponseHandle();

  const submitHandle = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!usernameInputElement.current?.value) {
        usernameInputElement.current?.classList.add("outline-red-500");
        usernameInputElement.current?.focus();
        return;
      }

      if (!passwordInputElement.current?.value) {
        passwordInputElement.current?.classList.add("outline-red-500");
        passwordInputElement.current?.focus();
        return;
      }

      setIsLoading(true);

      const encryptedPWD = await getEncrypted(
        passwordInputElement.current?.value
      );

      if (encryptedPWD === void 0) {
        setIsLoading(false);
        addAlert({
          type: "error",
          message: "加密失败，请重试",
          id: Date.now(),
        });
        return;
      }

      fetch(import.meta.env.VITE_SERVER_URL + "/admin/signin", {
        credentials: "include",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: usernameInputElement.current?.value,
          password: encryptedPWD,
        }),
      })
        .then((res) => res.json())
        .then(responseHandle)
        .then((data) => {
          setInfo(data as AuthInfoType);
          setTimeout(() => {
            navigate(-1);
          }, 1000);
          setIsLoading(false);
        })
        .catch(errorHandle);
    },
    [navigate, setInfo, addAlert, errorHandle, responseHandle]
  );

  return (
    <div className="h-screen bg-gray-100 dark:bg-gray-900 dark:text-white transition-colors duration-200 flex flex-col">
      <div className="flex flex-col items-center justify-center flex-1 w-full px-4 py-12 mx-auto md:px-0 lg:w-3/4">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-semibold text-center mb-10">
            登录你的管理员账号
          </h1>
          <form className="space-y-6" onSubmit={submitHandle}>
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                账号名
              </label>
              <div className="mt-1">
                <input
                  ref={usernameInputElement}
                  onChange={(e) => {
                    if (e.target.value) {
                      usernameInputElement.current?.classList.remove(
                        "outline-red-500"
                      );
                    }
                  }}
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="text"
                  className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                账号密码
              </label>
              <div className="mt-1">
                <input
                  ref={passwordInputElement}
                  onChange={(e) => {
                    if (e.target.value) {
                      passwordInputElement.current?.classList.remove(
                        "outline-red-500"
                      );
                    }
                  }}
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
            <div className="mt-10">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <span
                  className={
                    "loading loading-spinner" + (isLoading ? "" : " hidden")
                  }
                ></span>
                Sign in
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

async function getEncrypted(pwd: string) {
  const publicKey = await getPublicKey("/admin/get-public-key");

  if (!publicKey) {
    return;
  }

  const encrypted = await crypto.subtle.encrypt(
    {
      name: "RSA-OAEP",
    },
    publicKey,
    stringToBuffer(pwd)
  );

  return bufferToString(encrypted);
}

async function getPublicKey(reqPath: string) {
  const response = await fetch(import.meta.env.VITE_SERVER_URL + reqPath).then(
    (res) => res.json()
  );

  if (response.code !== 200 || !response.data) {
    return;
  }

  // 获取 PEM 字符串在头部和尾部之间的部分
  const pemContents = response.data
    .replace("-----BEGIN PUBLIC KEY-----\n", "")
    .replace("\n-----END PUBLIC KEY-----", "");
  // 将字符串通过 base64 解码为二进制数据
  const binaryDerString = window.atob(pemContents);
  // 将二进制字符串转换为 ArrayBuffer
  const binaryDer = base64ToBuffer(binaryDerString);

  return await window.crypto.subtle.importKey(
    "spki",
    binaryDer,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    ["encrypt"]
  );
}

function stringToBuffer(text: string) {
  const encoder = new TextEncoder();
  return encoder.encode(text).buffer;
}

function base64ToBuffer(str: string) {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

function bufferToString(buf: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}
