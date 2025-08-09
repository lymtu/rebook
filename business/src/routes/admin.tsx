import { useAuthContext } from "@/lib/context/auth/authContext";

const rootList = [
  {
    name: "admin:view",
    description: "查看权限",
  },
  {
    name: "admin:add",
    description: "添加权限",
  },
  {
    name: "admin:edit",
    description: "更新权限",
  },
  {
    name: "admin:delete",
    description: "删除权限",
  },
];

export default function Admin() {
  const { info } = useAuthContext();
  return (
    <>
      <div className="h-full flex flex-col">
        <h3 className="text-2xl font-bold">管理员权限</h3>

        <div className="mt-4 flex-1 flex flex-col items-center justify-center gap-6">
          {rootList.map((permission) => (
            <div className="flex items-center gap-6" key={permission.name}>
              <label
                className="text-2xl font-bold cursor-pointer"
                htmlFor={permission.name}
              >
                {permission.description}
              </label>
              <input
                id={permission.name}
                type="checkbox"
                defaultChecked={info.root.includes(permission.name)}
                readOnly
                onClick={(e) => {
                  e.preventDefault();
                }}
                className="checkbox dark:*:bg-white *:duration-150"
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
