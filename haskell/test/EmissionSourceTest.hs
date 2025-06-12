{- AUTOCOLLECT.TEST -}

module EmissionSourceTest
  (
  {- AUTOCOLLECT.TEST.export -}
  )
where

import Test.Tasty
import Test.Tasty.HUnit

test =
  testGroup
    "manually defining a test group"
    [ testCase "some test" $ pure (),
      testCase "some other test" $ pure ()
    ]