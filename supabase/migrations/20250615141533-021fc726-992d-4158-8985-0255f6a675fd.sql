
-- 1. Allow users to UPDATE their own contributions
CREATE POLICY "Users can update their own contributions"
  ON public.contributions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- 2. Allow users to DELETE their own contributions
CREATE POLICY "Users can delete their own contributions"
  ON public.contributions
  FOR DELETE
  USING (auth.uid() = user_id);

-- 3. Allow only admins to INSERT user roles
CREATE POLICY "Admins can add user roles"
  ON public.user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4. Allow only admins to UPDATE user roles
CREATE POLICY "Admins can update user roles"
  ON public.user_roles
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 5. Allow only admins to DELETE user roles
CREATE POLICY "Admins can delete user roles"
  ON public.user_roles
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
