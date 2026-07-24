      const { userId, isNewUser, email, firstName, tempPassword } = userResult;
      const enrolled = await enrollUserInCourse(userId, courseId, session.id);

      if (session.customer) await saveStripeCustomerId(userId, session.customer as string);

      // ── Affiliate commission tracking ─────────────────────────────────────────
      const referralCode = session.metadata?.referral_code;
      if (referralCode) {
        try {
          // Find affiliate by referral code
          const { data: affiliate } = await supabase
            .from("affiliates")
            .select("id, commission_rate, minimum_commission, total_earnings")
            .eq("referral_code", referralCode.toUpperCase())
            .eq("status", "approved")
            .maybeSingle();

          if (affiliate) {
            // Get course price
            const { data: course } = await supabase
              .from("courses")
              .select("title, price")
              .eq("id", courseId)
              .maybeSingle();

            const saleAmount = (course?.price || 0);
            const commissionPct = affiliate.commission_rate || 20;
            const minCommission = affiliate.minimum_commission || 10;
            const commissionAmount = Math.max(
              (saleAmount * commissionPct) / 100,
              minCommission
            );

            // Save commission record
            await supabase.from("affiliate_commissions").insert({
              affiliate_id: affiliate.id,
              course_id: courseId,
              course_title: course?.title || courseId,
              sale_amount: saleAmount,
              commission_rate: commissionPct,
              commission_amount: commissionAmount,
              status: "pending",
            });

            // Update affiliate total_earnings
            await supabase.from("affiliates").update({
              total_earnings: (affiliate.total_earnings || 0) + commissionAmount,
              updated_at: new Date().toISOString(),
            }).eq("id", affiliate.id);

            console.log(`✅ Commission recorded: ${referralCode} → £${commissionAmount} for ${courseId}`);
          }
        } catch (err: any) {
          console.error("❌ Commission tracking error:", err.message);
        }
      }

      if (enrolled) {
        if (isNewUser && tempPassword) {
          await sendSmtpEmail({
            to: email,
            subject: `Welcome to Covenant Learning — Your account and course are ready`,
            html: newAccountEmail(email, tempPassword, courseName, firstName),
          });
        } else {
          await sendSmtpEmail({
            to: email,
            subject: `You're enrolled in ${courseName} — Begin your journey today`,
            html: existingUserEmail(email, courseName, courseId, firstName),
          });
        }
      }