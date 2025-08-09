export function GreenBtn(
  props: React.ButtonHTMLAttributes<HTMLButtonElement>,
  className?: string
) {
  return (
    <button
      className={
        "btn not-dark:btn-soft btn-sm btn-accent not-dark:hover:text-white dark:text-white " +
        className
      }
      {...props}
    >
      {props.children}
    </button>
  );
}

export function RedBtn(
  props: React.ButtonHTMLAttributes<HTMLButtonElement>,
  className?: string
) {
  return (
    <button
      className={
        "btn not-dark:btn-soft btn-sm btn-error not-dark:hover:text-white dark:text-white " +
        className
      }
      {...props}
    >
      {props.children}
    </button>
  );
}
