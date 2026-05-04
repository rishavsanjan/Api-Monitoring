const Background = () => (
  <div className="fixed inset-0 -z-10 bg-[#101722]">
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808010_1px,transparent_1px),linear-gradient(to_bottom,#80808010_1px,transparent_1px)] bg-[size:24px_24px]" />
    <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[400px] w-[400px] rounded-full bg-blue-500 opacity-[0.08] blur-[120px]" />
    <div className="absolute right-0 bottom-0 h-[300px] w-[300px] rounded-full bg-violet-500 opacity-[0.05] blur-[100px]" />
  </div>
);

export default Background