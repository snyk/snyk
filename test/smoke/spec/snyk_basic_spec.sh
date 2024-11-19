#shellcheck shell=sh

Describe "Snyk CLI basics"
  Describe "snyk config"
    It "prints config"
      When run snyk config
      The stdout should equal ""
      The status should be success
    End

    It "sets config"
      When run snyk config set newkey=newvalue
      The output should include "newkey updated"
      The status should be success
      The result of "print_snyk_config()" should include "newkey: newvalue"
    End

    It "unsets config"
      When run snyk config unset newkey
      The output should include "newkey deleted"
      The status should be success
      The result of "print_snyk_config()" should not include "newkey"
      The result of "print_snyk_config()" should not include "newvalue"
    End
  End
End
