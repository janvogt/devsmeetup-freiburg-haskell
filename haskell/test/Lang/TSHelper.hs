module Lang.TSHelper ((??), (?), (!)) where

(??) :: Maybe a -> a -> a
Just x ?? _ = x
_ ?? x = x

infixl 5 ??

(?) :: Maybe a -> (a -> b) -> Maybe b
Nothing ? _ = Nothing
Just x ? f = Just (f x)

infixl 5 ?

(!) :: Maybe a -> a
(!) (Just x) = x
(!) _ = error "unwrap: Unwraped a Nothing value."
{-# WARNING in "x-partial" (!) "This is a partial function" #-}
