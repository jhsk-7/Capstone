  const onLogin = async (e) => {
    e?.preventDefault();
    if (isDisabled) return;

    try {
      setErrMsg("");
      setLoading(true);
      const res = await axios.post("/api/users/userAuth/login", user, { withCredentials: true });
      setIsLoggedIn(true)
      console.log(isLoggedIn)
      router.push("/user/myBikes");
    } catch (err) {
      const findStatus = async () => {
        const { status, message} = normalizeError(err);
        setErrMsg(message);
      };
      await findStatus();

    } finally {
      setLoading(false);
    }
  };